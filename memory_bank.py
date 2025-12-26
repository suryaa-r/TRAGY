import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

class MemoryBank:
    def __init__(self, storage_path: str = "memories.json"):
        self.storage_path = storage_path
        self.memories = self._load_memories()
    
    def _load_memories(self) -> Dict[str, Any]:
        if os.path.exists(self.storage_path):
            with open(self.storage_path, 'r') as f:
                return json.load(f)
        return {"memories": [], "metadata": {"created": datetime.now().isoformat()}}
    
    def _save_memories(self):
        with open(self.storage_path, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def store(self, content: str, tags: List[str] = None, priority: int = 1) -> str:
        memory_id = f"mem_{len(self.memories['memories'])}"
        memory = {
            "id": memory_id,
            "content": content,
            "tags": tags or [],
            "priority": priority,
            "timestamp": datetime.now().isoformat()
        }
        self.memories["memories"].append(memory)
        self._save_memories()
        return memory_id
    
    def retrieve(self, query: str = None, tags: List[str] = None, limit: int = 10) -> List[Dict]:
        results = self.memories["memories"]
        
        if tags:
            results = [m for m in results if any(tag in m["tags"] for tag in tags)]
        
        if query:
            results = [m for m in results if query.lower() in m["content"].lower()]
        
        return sorted(results, key=lambda x: x["priority"], reverse=True)[:limit]
    
    def delete(self, memory_id: str) -> bool:
        original_count = len(self.memories["memories"])
        self.memories["memories"] = [m for m in self.memories["memories"] if m["id"] != memory_id]
        if len(self.memories["memories"]) < original_count:
            self._save_memories()
            return True
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_memories": len(self.memories["memories"]),
            "created": self.memories["metadata"]["created"],
            "last_updated": datetime.now().isoformat()
        }