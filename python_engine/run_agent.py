"""Called by Node.js backend via child_process for Agent queries."""
import sys, json
from rag_engine   import RAGEngine
from genai_engine import GenAIEngine
from agent_engine import AgentEngine

def main():
    try:
        inp = json.loads(sys.stdin.read())
    except:
        inp = {}

    question = inp.get("question", "What is the current macro regime and what should I do?")

    rag   = RAGEngine();   rag.initialize()
    genai = GenAIEngine()
    agent = AgentEngine(rag_engine=rag, genai_engine=genai)

    result = agent.run(question)
    print(json.dumps(result, default=str))

if __name__ == "__main__":
    main()
