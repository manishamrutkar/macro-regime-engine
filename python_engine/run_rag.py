"""Called by Node.js backend via child_process for RAG queries."""
import sys, json
from rag_engine import RAGEngine

def main():
    try:
        inp = json.loads(sys.stdin.read())
    except:
        inp = {}

    rag = RAGEngine()
    rag.initialize()

    action = inp.get("action", "query")

    if action == "add_document":
        result = rag.add_document(
            text=inp.get("text", ""),
            title=inp.get("title", "Document"),
            source=inp.get("source", "User Upload"),
        )
    else:
        question = inp.get("question", inp.get("query", "What is the current macro regime?"))
        result = rag.query(question)

    print(json.dumps(result))

if __name__ == "__main__":
    main()
