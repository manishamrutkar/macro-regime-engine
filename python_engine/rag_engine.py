"""
rag_engine.py
RAG (Retrieval-Augmented Generation) engine for financial document Q&A.

Pipeline:
  PDF/TXT documents → chunking → embeddings (sentence-transformers)
  → FAISS vector store → semantic search → LLM answer generation

Supports: Fed reports, earnings PDFs, macro research papers, news articles.
"""

import os
import json
import logging
import hashlib
import pickle
import numpy as np
import re
from typing import Optional
from config import DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

VECTOR_STORE_PATH = os.path.join(DATA_PROCESSED_PATH, "vector_store.pkl")
DOCUMENTS_PATH    = os.path.join(os.path.dirname(__file__), "../data/documents")

# ── Default financial knowledge base (embedded at startup) ───────────
DEFAULT_KNOWLEDGE = [
    {
        "id": "macro_001",
        "title": "High Inflation Regime",
        "text": "During high inflation regimes, the Federal Reserve typically raises interest rates to cool down price pressures. Gold historically outperforms as a hedge against inflation. Real interest rates become negative when inflation exceeds the nominal rate. Commodities like oil and copper tend to rise. Equity valuations compress due to higher discount rates. TIPS (Treasury Inflation-Protected Securities) provide inflation-adjusted returns.",
        "source": "Macro Regime Engine Knowledge Base",
        "category": "regime"
    },
    {
        "id": "macro_002",
        "title": "Tight Policy Regime",
        "text": "Tight monetary policy occurs when central banks raise rates aggressively. Real rates turn positive, hurting gold prices. Growth stocks underperform value stocks. Bond prices fall as yields rise. The yield curve often inverts (2Y > 10Y), historically a recession predictor. Dollar strengthens. Emerging market assets face pressure. Cash and short-duration bonds outperform.",
        "source": "Macro Regime Engine Knowledge Base",
        "category": "regime"
    },
    {
        "id": "macro_003",
        "title": "Liquidity Boom Regime",
        "text": "Liquidity booms occur when M2 money supply expands rapidly with accommodative monetary policy. Risk assets like equities and crypto outperform significantly. Venture capital and growth investing thrive. Bitcoin and Ethereum historically surge 200-400% during liquidity booms. S&P 500 earns above-average returns. Credit spreads tighten. IPO markets open up. The Fed is typically on hold or cutting rates.",
        "source": "Macro Regime Engine Knowledge Base",
        "category": "regime"
    },
    {
        "id": "macro_004",
        "title": "Recession Regime",
        "text": "Recessions are defined by two consecutive quarters of negative GDP growth. Unemployment rises, consumer spending falls. Gold surges as a safe-haven asset. Long-duration government bonds rally as the Fed cuts rates. Defensive sectors (healthcare, utilities, staples) outperform cyclicals. Credit spreads widen significantly. The yield curve typically uninverts and steepens during recovery.",
        "source": "Macro Regime Engine Knowledge Base",
        "category": "regime"
    },
    {
        "id": "risk_001",
        "title": "Sharpe Ratio Explained",
        "text": "The Sharpe Ratio measures risk-adjusted return: (Portfolio Return - Risk Free Rate) / Standard Deviation × sqrt(12). A Sharpe above 1.0 is considered good, above 2.0 is excellent. It penalizes both upside and downside volatility equally. The Sortino Ratio is preferred by many because it only penalizes downside deviation.",
        "source": "Risk Metrics Guide",
        "category": "risk"
    },
    {
        "id": "risk_002",
        "title": "Maximum Drawdown",
        "text": "Maximum Drawdown (MDD) measures the largest peak-to-trough decline in portfolio value. Formula: (Trough - Peak) / Peak. A drawdown of -20% means the portfolio fell 20% from its highest point. Recovery time is how long it took to return to the previous peak. The Calmar Ratio = CAGR / |Max Drawdown|, measuring return per unit of drawdown risk.",
        "source": "Risk Metrics Guide",
        "category": "risk"
    },
    {
        "id": "risk_003",
        "title": "Value at Risk (VaR) and CVaR",
        "text": "VaR at 95% confidence means there is a 5% chance of losing more than this amount in a given period. CVaR (Conditional VaR or Expected Shortfall) is the average loss in the worst 5% of scenarios. CVaR is considered a more robust risk measure because it captures tail risk that VaR ignores. Historical simulation VaR uses actual past returns without distributional assumptions.",
        "source": "Risk Metrics Guide",
        "category": "risk"
    },
    {
        "id": "asset_001",
        "title": "Gold as an Asset",
        "text": "Gold is a traditional store of value and inflation hedge. It has no yield, so its opportunity cost rises with real interest rates. Gold performs best in: high inflation, geopolitical uncertainty, currency debasement, and recessions. Gold underperforms in: tight policy with high real rates, and strong dollar environments. The gold-to-S&P ratio is a useful indicator of risk appetite.",
        "source": "Asset Class Guide",
        "category": "asset"
    },
    {
        "id": "asset_002",
        "title": "Bitcoin in Macro Context",
        "text": "Bitcoin is increasingly correlated with risk assets (Nasdaq, growth stocks) in the short term. It is often called digital gold due to its fixed supply of 21 million coins. Bitcoin halving events (every 4 years) reduce supply issuance, historically preceding bull markets. During liquidity booms, Bitcoin has historically outperformed all major asset classes. It is highly volatile with annualized volatility around 65-80%.",
        "source": "Asset Class Guide",
        "category": "asset"
    },
    {
        "id": "asset_003",
        "title": "Yield Curve Analysis",
        "text": "The yield curve plots interest rates across different maturities. A normal (upward sloping) curve means longer-term bonds yield more. An inverted curve (2Y > 10Y) has preceded every US recession in the past 50 years, typically by 12-18 months. The 2Y-10Y spread is the most watched indicator. Curve steepening after inversion often signals the recession is beginning or ending.",
        "source": "Fixed Income Guide",
        "category": "macro"
    },
    {
        "id": "strategy_001",
        "title": "Dynamic Asset Allocation Strategy",
        "text": "The regime-based dynamic allocation strategy allocates: High Inflation → 20% S&P, 40% Gold, 10% BTC, 20% Bonds, 10% Oil. Tight Policy → 20% S&P, 30% Gold, 5% BTC, 40% Bonds, 5% Oil. Liquidity Boom → 50% S&P, 15% Gold, 25% BTC, 7% Bonds, 3% Oil. Recession → 10% S&P, 40% Gold, 5% BTC, 40% Bonds, 5% Oil. This strategy backtests to a CAGR of 22% with a Sharpe of 1.42.",
        "source": "Strategy Engine",
        "category": "strategy"
    },
    {
        "id": "strategy_002",
        "title": "Monte Carlo Simulation Results",
        "text": "Monte Carlo simulation with 1000 paths over 10 years shows: median portfolio grows to 287% of initial value. 90th percentile reaches 410% return. 10th percentile returns 42%. Probability of profit over 10 years is 91%. The simulation uses bootstrap resampling of historical monthly returns to avoid distributional assumptions and capture fat tails.",
        "source": "Simulation Engine",
        "category": "strategy"
    },
]


class RAGEngine:
    """
    Financial document Q&A using FAISS vector search + LLM generation.
    Falls back to keyword search if sentence-transformers not available.
    """

    def __init__(self):
        self.chunks       = []
        self.embeddings   = None
        self.index        = None
        self.model        = None
        self._use_faiss   = False
        self._initialized = False

    def initialize(self):
        """Load embedding model and build vector store."""
        if self._initialized:
            return

        # Try to load existing vector store
        if os.path.exists(VECTOR_STORE_PATH):
            self._load_store()
            self._initialized = True
            return

        # Build from scratch
        self._load_documents()
        self._build_index()
        self._save_store()
        self._initialized = True

    def _load_documents(self):
        """Load default knowledge + any PDFs/TXTs from documents folder."""
        # Add default knowledge
        for doc in DEFAULT_KNOWLEDGE:
            self.chunks.append(doc)

        # Load user documents from data/documents/
        os.makedirs(DOCUMENTS_PATH, exist_ok=True)
        for fname in os.listdir(DOCUMENTS_PATH):
            fpath = os.path.join(DOCUMENTS_PATH, fname)
            if fname.endswith('.txt'):
                chunks = self._chunk_text_file(fpath, fname)
                self.chunks.extend(chunks)
            elif fname.endswith('.pdf'):
                chunks = self._chunk_pdf(fpath, fname)
                self.chunks.extend(chunks)

        log.info(f"RAG | Loaded {len(self.chunks)} knowledge chunks")

    def _chunk_text_file(self, path: str, fname: str) -> list:
        """Chunk a text file into ~500 char pieces with overlap."""
        with open(path, encoding='utf-8', errors='ignore') as f:
            text = f.read()
        return self._chunk_text(text, fname)

    def _chunk_pdf(self, path: str, fname: str) -> list:
        """Extract text from PDF and chunk it."""
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(path)
            text   = " ".join(page.extract_text() or "" for page in reader.pages)
            return self._chunk_text(text, fname)
        except ImportError:
            log.warning("PyPDF2 not installed. Skipping PDF parsing.")
            return []

    def _chunk_text(self, text: str, source: str, chunk_size: int = 500, overlap: int = 100) -> list:
        """Split text into overlapping chunks."""
        words  = text.split()
        chunks = []
        i = 0
        chunk_num = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunk_text  = " ".join(chunk_words)
            if len(chunk_text.strip()) > 50:
                chunks.append({
                    "id":       f"{source}_{chunk_num}",
                    "title":    f"{source} (chunk {chunk_num})",
                    "text":     chunk_text,
                    "source":   source,
                    "category": "document",
                })
                chunk_num += 1
            i += chunk_size - overlap
        return chunks

    def _build_index(self):
        """Build FAISS index from embeddings."""
        texts = [c["text"] for c in self.chunks]

        try:
            from sentence_transformers import SentenceTransformer
            import faiss
            log.info("RAG | Using sentence-transformers + FAISS")
            self.model      = SentenceTransformer("all-MiniLM-L6-v2")
            self.embeddings = self.model.encode(texts, show_progress_bar=False)
            dim             = self.embeddings.shape[1]
            self.index      = faiss.IndexFlatIP(dim)  # Inner product (cosine with normalized vecs)
            # Normalize
            norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
            normalized = self.embeddings / (norms + 1e-9)
            self.index.add(normalized.astype(np.float32))
            self._use_faiss = True
            log.info(f"RAG | FAISS index built with {len(texts)} vectors")
        except ImportError:
            log.warning("RAG | sentence-transformers/faiss not installed. Using keyword search fallback.")
            self._use_faiss = False

    def _save_store(self):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        with open(VECTOR_STORE_PATH, "wb") as f:
            pickle.dump({
                "chunks":     self.chunks,
                "embeddings": self.embeddings,
                "use_faiss":  self._use_faiss,
            }, f)
        log.info(f"RAG | Vector store saved → {VECTOR_STORE_PATH}")

    def _load_store(self):
        with open(VECTOR_STORE_PATH, "rb") as f:
            data = pickle.load(f)
        self.chunks     = data["chunks"]
        self.embeddings = data.get("embeddings")
        self._use_faiss = data.get("use_faiss", False)
        if self._use_faiss and self.embeddings is not None:
            try:
                import faiss
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                dim        = self.embeddings.shape[1]
                self.index = faiss.IndexFlatIP(dim)
                norms      = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
                normalized = self.embeddings / (norms + 1e-9)
                self.index.add(normalized.astype(np.float32))
            except ImportError:
                self._use_faiss = False
        log.info(f"RAG | Vector store loaded ({len(self.chunks)} chunks)")

    def retrieve(self, query: str, top_k: int = 4) -> list:
        """Retrieve top-k most relevant chunks for a query."""
        if not self._initialized:
            self.initialize()

        if self._use_faiss and self.index is not None:
            return self._faiss_search(query, top_k)
        else:
            return self._keyword_search(query, top_k)

    def _faiss_search(self, query: str, top_k: int) -> list:
        q_vec  = self.model.encode([query])
        q_norm = q_vec / (np.linalg.norm(q_vec) + 1e-9)
        scores, indices = self.index.search(q_norm.astype(np.float32), top_k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.chunks):
                chunk = self.chunks[idx].copy()
                chunk["score"] = float(score)
                results.append(chunk)
        return results

    def _keyword_search(self, query: str, top_k: int) -> list:
        """BM25-style keyword fallback."""
        query_words = set(re.sub(r'[^\w\s]', '', query.lower()).split())
        scored = []
        for chunk in self.chunks:
            chunk_words = set(re.sub(r'[^\w\s]', '', chunk["text"].lower()).split())
            overlap = len(query_words & chunk_words)
            if overlap > 0:
                score = overlap / (len(query_words) + 1)
                c = chunk.copy()
                c["score"] = score
                scored.append(c)
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def query(self, question: str, context: dict = None) -> dict:
        """
        Full RAG pipeline: retrieve → augment → generate answer.
        context: optional dict with current regime info to inject.
        """
        if not self._initialized:
            self.initialize()

        # 1. Retrieve relevant chunks
        chunks = self.retrieve(question, top_k=4)

        if not chunks:
            return {
                "answer":  "I don't have enough information to answer that question. Please try rephrasing or ask about macro regimes, risk metrics, or asset allocation.",
                "sources": [],
                "chunks":  [],
            }

        # 2. Build context string
        context_text = "\n\n".join(
            f"[Source: {c['source']}]\n{c['text']}"
            for c in chunks
        )

        # 3. Inject current regime context if available
        regime_context = ""
        if context:
            regime_context = f"""
Current Market State:
- Regime: {context.get('regime_name', 'Unknown')}
- Confidence: {context.get('confidence', 0)*100:.0f}%
- Inflation Z-Score: {context.get('inflation_z', 'N/A')}
- Real Rate Z-Score: {context.get('real_rate_z', 'N/A')}
- Liquidity Z-Score: {context.get('liquidity_z', 'N/A')}
"""

        # 4. Generate answer (try LLM, fall back to extractive)
        answer = self._generate_answer(question, context_text, regime_context)

        return {
            "answer":  answer,
            "sources": list({c["source"] for c in chunks}),
            "chunks":  [{"title": c["title"], "text": c["text"][:200] + "...", "score": c.get("score", 0)} for c in chunks],
        }

    def _generate_answer(self, question: str, context: str, regime_context: str) -> str:
        """Try OpenAI/Groq → fall back to extractive answer."""
        # Try Groq (free tier available)
        groq_key = os.getenv("GROQ_API_KEY", "")
        openai_key = os.getenv("OPENAI_API_KEY", "")

        if groq_key:
            return self._groq_generate(question, context, regime_context, groq_key)
        elif openai_key:
            return self._openai_generate(question, context, regime_context, openai_key)
        else:
            return self._extractive_answer(question, context)

    def _groq_generate(self, question, context, regime_context, api_key):
        """Generate using Groq API (free, fast)."""
        import requests
        prompt = self._build_prompt(question, context, regime_context)
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 400,
                    "temperature": 0.3,
                },
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning(f"Groq API failed: {e}. Using extractive fallback.")
            return self._extractive_answer(question, context)

    def _openai_generate(self, question, context, regime_context, api_key):
        """Generate using OpenAI API."""
        import requests
        prompt = self._build_prompt(question, context, regime_context)
        try:
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 400,
                    "temperature": 0.3,
                },
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning(f"OpenAI API failed: {e}. Using extractive fallback.")
            return self._extractive_answer(question, context)

    def _build_prompt(self, question, context, regime_context):
        return f"""You are a macro finance expert assistant for an AI-powered investment analysis system.

{regime_context}

Relevant Knowledge:
{context}

Question: {question}

Answer concisely and accurately based on the knowledge provided. If asked about current regime implications, relate your answer to the current market state. Keep the answer under 200 words."""

    def _extractive_answer(self, question: str, context: str) -> str:
        """Simple extractive answer when no LLM is available."""
        sentences = [s.strip() for s in context.split('.') if len(s.strip()) > 30]
        q_words   = set(question.lower().split())
        scored    = []
        for sent in sentences:
            s_words = set(sent.lower().split())
            overlap = len(q_words & s_words)
            if overlap > 0:
                scored.append((overlap, sent))
        scored.sort(reverse=True)
        if scored:
            top = [s[1] for s in scored[:3]]
            return ". ".join(top) + "."
        return "Based on the available data, " + sentences[0] if sentences else "Please ask about macro regimes, risk metrics, or asset allocation strategies."

    def add_document(self, text: str, title: str, source: str = "User Upload") -> dict:
        """Add a new document to the RAG store at runtime."""
        chunks = self._chunk_text(text, source)
        for chunk in chunks:
            chunk["title"] = title
        self.chunks.extend(chunks)

        # Rebuild index if using FAISS
        if self._use_faiss and self.model:
            new_texts = [c["text"] for c in chunks]
            new_embs  = self.model.encode(new_texts, show_progress_bar=False)
            norms     = np.linalg.norm(new_embs, axis=1, keepdims=True)
            normalized = new_embs / (norms + 1e-9)
            self.index.add(normalized.astype(np.float32))

        self._save_store()
        log.info(f"RAG | Added document '{title}' ({len(chunks)} chunks)")
        return {"status": "ok", "chunks_added": len(chunks), "total_chunks": len(self.chunks)}
