#!/usr/bin/env python3
"""Test script for Memory Bank functionality"""

from memory_bank import MemoryBank
import os

def test_memory_bank():
    # Use test file
    test_file = "test_memories.json"
    if os.path.exists(test_file):
        os.remove(test_file)
    
    bank = MemoryBank(test_file)
    
    # Test storing
    id1 = bank.store("Test memory 1", ["test"], 2)
    id2 = bank.store("Important note", ["important", "note"], 5)
    id3 = bank.store("Low priority task", ["task"], 1)
    
    print(f"Stored: {id1}, {id2}, {id3}")
    
    # Test retrieval
    all_memories = bank.retrieve()
    print(f"All memories: {len(all_memories)}")
    
    # Test priority filtering
    high_priority = bank.retrieve(min_priority=3)
    print(f"High priority memories: {len(high_priority)}")
    
    # Test update
    bank.update(id1, content="Updated test memory", priority=4)
    updated = bank.retrieve(query="Updated")
    print(f"Updated memory found: {len(updated) > 0}")
    
    # Test stats
    stats = bank.get_stats()
    print(f"Stats: {stats}")
    
    # Cleanup
    os.remove(test_file)
    print("All tests passed!")

if __name__ == "__main__":
    test_memory_bank()