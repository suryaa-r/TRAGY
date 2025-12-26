from memory_bank import MemoryBank

# Initialize Memory Bank
bank = MemoryBank()

# Store some example memories
bank.store("Project started with TRAGY logo design", ["project", "design"], priority=3)
bank.store("Need to implement user authentication", ["todo", "auth"], priority=2)
bank.store("Bug found in memory retrieval function", ["bug", "critical"], priority=5)

# Retrieve memories
print("All memories:")
for memory in bank.retrieve():
    print(f"- {memory['content']} (Priority: {memory['priority']})")

print("\nHigh priority memories:")
for memory in bank.retrieve(limit=2):
    print(f"- {memory['content']}")

print(f"\nStats: {bank.get_stats()}")