#!/usr/bin/env python3
import argparse
from memory_bank import MemoryBank

def main():
    parser = argparse.ArgumentParser(description="Memory Bank CLI")
    parser.add_argument("action", choices=["store", "retrieve", "delete", "update", "stats"])
    parser.add_argument("--content", help="Content to store")
    parser.add_argument("--tags", nargs="*", help="Tags for the memory")
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--id", help="Memory ID")
    parser.add_argument("--priority", type=int, help="Priority level")
    parser.add_argument("--min-priority", type=int, help="Minimum priority for search")
    parser.add_argument("--limit", type=int, default=10, help="Limit results")
    
    args = parser.parse_args()
    bank = MemoryBank()
    
    if args.action == "store":
        if not args.content:
            print("Content required for storing")
            return
        memory_id = bank.store(args.content, args.tags or [], args.priority or 1)
        print(f"Stored memory: {memory_id}")
    
    elif args.action == "retrieve":
        memories = bank.retrieve(args.query, args.tags, getattr(args, 'min_priority', None), args.limit)
        for memory in memories:
            print(f"[{memory['id']}] {memory['content'][:50]}... (Priority: {memory['priority']})")
    
    elif args.action == "delete":
        if not args.id:
            print("Memory ID required for deletion")
            return
        if bank.delete(args.id):
            print(f"Deleted memory: {args.id}")
        else:
            print("Memory not found")
    
    elif args.action == "update":
        if not args.id:
            print("Memory ID required for update")
            return
        if bank.update(args.id, args.content, args.tags, args.priority):
            print(f"Updated memory: {args.id}")
        else:
            print("Memory not found")
    
    elif args.action == "stats":
        stats = bank.get_stats()
        print(f"Total memories: {stats['total_memories']}")
        print(f"Average priority: {stats['avg_priority']:.1f}")
        print(f"Created: {stats['created']}")

if __name__ == "__main__":
    main()