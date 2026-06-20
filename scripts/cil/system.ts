/**
 * CrackGate — CIL Management Trainee (System / Computer Science) Paper-II generator.
 *
 *   npx tsx scripts/cil/system.ts                 # sets 1..15
 *   npx tsx scripts/cil/system.ts --only=11,12
 *   npx tsx scripts/cil/system.ts --from=1 --to=10
 *
 * Paper-I (100 Q) is the shared CIL core. This file supplies only Paper-II
 * (Professional Knowledge, 100 Q = ~60 theory + ~40 numerical) for the System
 * (Computer Science / IT) discipline, authored to be conceptual and
 * fundamentals-first, with SVG figures (binary trees, logic gates, graphs,
 * stacks) rendered by the app's QuestionFigure engine.
 */
import {
  mcqFrom,
  fillSpecs,
  rotateSlice,
  drawDistinct,
  shuffleInPlace,
  SUBJ,
  r2,
  r1,
  pick,
} from "../build_cil_civil";
import type { FactQ, Q, SpecGen } from "../build_cil_civil";
import { runDiscipline } from "./core";

// ─── Curated CS theory pool (base: easy / medium) ────────────────────────────
const SYS_THEORY_POOL: FactQ[] = [
  // Data structures
  { topic: "Data Structures", difficulty: "easy", stem: "A stack follows the ordering principle:", correct: "Last-In-First-Out (LIFO)", distractors: ["First-In-First-Out (FIFO)", "Random access", "Priority order"], solution: "The most recently pushed element is the first to be popped — LIFO." },
  { topic: "Data Structures", difficulty: "easy", stem: "A queue follows the ordering principle:", correct: "First-In-First-Out (FIFO)", distractors: ["Last-In-First-Out (LIFO)", "Highest-priority-first", "Random"], solution: "Elements leave a queue in the same order they entered — FIFO." },
  { topic: "Data Structures", difficulty: "medium", stem: "Accessing the i-th element of an array by index takes time:", correct: "O(1)", distractors: ["O(n)", "O(log n)", "O(n log n)"], solution: "Arrays support constant-time random access via base address + index×size." },
  { topic: "Data Structures", difficulty: "medium", stem: "Inserting a node at the front of a singly linked list takes time:", correct: "O(1)", distractors: ["O(n)", "O(log n)", "O(n²)"], solution: "Only a couple of pointer updates are needed — constant time." },
  { topic: "Data Structures", difficulty: "medium", stem: "An in-order traversal of a binary search tree visits the keys in:", correct: "Ascending sorted order", distractors: ["Descending order", "Level order", "Random order"], solution: "In-order (left–root–right) of a BST yields keys in ascending order." },
  { topic: "Data Structures", difficulty: "medium", stem: "The average-case time to search a well-distributed hash table is:", correct: "O(1)", distractors: ["O(n)", "O(log n)", "O(n log n)"], solution: "With a good hash function and low load factor, lookup is expected constant time." },
  { topic: "Data Structures", difficulty: "medium", stem: "A max-heap is a complete binary tree in which each parent is:", correct: "Greater than or equal to its children", distractors: ["Less than its children", "Equal to its children only", "Unrelated to its children"], solution: "In a max-heap every parent ≥ its children, putting the maximum at the root." },
  { topic: "Data Structures", difficulty: "medium", stem: "The adjacency-matrix representation of a graph with V vertices needs space:", correct: "O(V²)", distractors: ["O(V)", "O(E)", "O(V + E)"], solution: "A V×V matrix stores every possible edge, using O(V²) space regardless of edge count." },
  // Algorithms
  { topic: "Algorithms", difficulty: "easy", stem: "Binary search on a sorted array of n elements runs in:", correct: "O(log n)", distractors: ["O(n)", "O(1)", "O(n log n)"], solution: "Each comparison halves the search space, giving logarithmic time — but the array must be sorted." },
  { topic: "Algorithms", difficulty: "easy", stem: "Linear search of an unsorted array of n items takes, in the worst case:", correct: "O(n)", distractors: ["O(log n)", "O(1)", "O(n²)"], solution: "It may examine every element, so worst-case time is O(n)." },
  { topic: "Algorithms", difficulty: "medium", stem: "The average and worst-case time complexity of merge sort is:", correct: "O(n log n)", distractors: ["O(n²)", "O(n)", "O(log n)"], solution: "Merge sort always divides and merges in O(n log n), and it is stable." },
  { topic: "Algorithms", difficulty: "medium", stem: "The worst-case time complexity of quicksort is:", correct: "O(n²)", distractors: ["O(n log n)", "O(n)", "O(log n)"], solution: "With consistently poor pivots (e.g. already-sorted input) quicksort degrades to O(n²)." },
  { topic: "Algorithms", difficulty: "medium", stem: "Bubble sort has a worst-case time complexity of:", correct: "O(n²)", distractors: ["O(n log n)", "O(n)", "O(log n)"], solution: "Bubble sort makes ~n²/2 comparisons in the worst case." },
  { topic: "Algorithms", difficulty: "medium", stem: "Dijkstra's algorithm finds shortest paths correctly only when edge weights are:", correct: "Non-negative", distractors: ["All negative", "All equal", "Always integers"], solution: "Dijkstra assumes non-negative weights; negative edges require Bellman–Ford." },
  { topic: "Algorithms", difficulty: "medium", stem: "Every recursive function must have a:", correct: "Base case", distractors: ["Loop", "Global variable", "Pointer"], solution: "Without a base (terminating) case, recursion never stops and overflows the stack." },
  // Operating systems
  { topic: "Operating Systems", difficulty: "medium", stem: "Compared with a process, a thread:", correct: "Shares the address space of its process", distractors: ["Has a completely separate address space", "Cannot run concurrently", "Has its own copy of global data"], solution: "Threads of a process share code, data and heap, but have their own stack and registers." },
  { topic: "Operating Systems", difficulty: "medium", stem: "Paging is a memory-management scheme that maps:", correct: "Logical pages to physical frames", distractors: ["Files to directories", "Processes to CPUs", "Disks to caches"], solution: "Paging divides memory into fixed-size pages/frames and uses a page table to map them." },
  { topic: "Operating Systems", difficulty: "medium", stem: "A semaphore is primarily used for:", correct: "Process synchronisation / mutual exclusion", distractors: ["Memory allocation", "File compression", "CPU caching"], solution: "Semaphores coordinate access to shared resources, preventing race conditions." },
  { topic: "Operating Systems", difficulty: "medium", stem: "In round-robin CPU scheduling, each process is given:", correct: "A fixed time quantum in turn", distractors: ["The CPU until it finishes", "Priority-based unlimited time", "No CPU time"], solution: "Round-robin cycles through ready processes, each running for one time quantum." },
  { topic: "Operating Systems", difficulty: "medium", stem: "Thrashing in a virtual-memory system refers to:", correct: "Excessive paging that cripples useful work", distractors: ["A disk hardware fault", "A CPU overheating state", "A network congestion event"], solution: "When processes spend more time swapping pages than computing, the system thrashes." },
  { topic: "Operating Systems", difficulty: "medium", stem: "The portion of code where a process accesses shared resources is the:", correct: "Critical section", distractors: ["Boot sector", "Page table", "Ready queue"], solution: "Mutual exclusion must be enforced over the critical section to avoid race conditions." },
  { topic: "Operating Systems", difficulty: "easy", stem: "Virtual memory allows a program to:", correct: "Use more address space than physical RAM", distractors: ["Run without any RAM", "Avoid using the disk", "Disable the CPU cache"], solution: "Virtual memory backs part of the address space on disk, giving the illusion of large RAM." },
  // DBMS
  { topic: "DBMS", difficulty: "easy", stem: "A primary key in a relation must be:", correct: "Unique and not null", distractors: ["Allowed to repeat", "Always numeric", "Allowed to be null"], solution: "A primary key uniquely identifies each tuple and cannot be null." },
  { topic: "DBMS", difficulty: "medium", stem: "Normalization of a database is performed mainly to:", correct: "Reduce redundancy and avoid update anomalies", distractors: ["Increase redundancy", "Speed up all queries", "Remove all relationships"], solution: "Normalization organizes data to minimize duplication and anomalies." },
  { topic: "DBMS", difficulty: "medium", stem: "The ACID properties of a transaction stand for:", correct: "Atomicity, Consistency, Isolation, Durability", distractors: ["Accuracy, Control, Integrity, Data", "Atomicity, Concurrency, Indexing, Durability", "Access, Consistency, Isolation, Distribution"], solution: "ACID guarantees reliable transaction processing." },
  { topic: "DBMS", difficulty: "medium", stem: "A foreign key enforces:", correct: "Referential integrity between tables", distractors: ["Uniqueness within a single column", "Sorting of rows", "Physical storage order"], solution: "A foreign key must match a primary key in the referenced table (or be null), enforcing referential integrity." },
  { topic: "DBMS", difficulty: "medium", stem: "An index on a database column generally:", correct: "Speeds up reads but can slow down writes", distractors: ["Speeds up both reads and writes equally", "Has no effect on performance", "Only saves storage"], solution: "Indexes accelerate lookups but add overhead to inserts/updates that must maintain them." },
  { topic: "DBMS", difficulty: "medium", stem: "The SQL clause used to retrieve data from a table is:", correct: "SELECT", distractors: ["INSERT", "UPDATE", "CREATE"], solution: "SELECT … FROM … queries rows from one or more tables." },
  // Networks
  { topic: "Computer Networks", difficulty: "easy", stem: "The OSI reference model has how many layers?", correct: "7", distractors: ["5", "4", "8"], solution: "OSI: Physical, Data-link, Network, Transport, Session, Presentation, Application." },
  { topic: "Computer Networks", difficulty: "medium", stem: "TCP provides a service that is:", correct: "Reliable and connection-oriented", distractors: ["Unreliable and connectionless", "Reliable but connectionless", "Connection-oriented but unreliable"], solution: "TCP uses handshakes, acknowledgements and retransmission for reliable, ordered delivery." },
  { topic: "Computer Networks", difficulty: "medium", stem: "UDP, in contrast to TCP, is:", correct: "Connectionless and unreliable (best-effort)", distractors: ["Connection-oriented and reliable", "Reliable but connectionless", "Slower than TCP"], solution: "UDP sends datagrams without setup, acknowledgements or guaranteed delivery." },
  { topic: "Computer Networks", difficulty: "medium", stem: "A router operates principally at the OSI:", correct: "Network layer (Layer 3)", distractors: ["Data-link layer (Layer 2)", "Physical layer (Layer 1)", "Application layer (Layer 7)"], solution: "Routers forward packets using IP addresses at the network layer." },
  { topic: "Computer Networks", difficulty: "medium", stem: "A switch (LAN) forwards frames using:", correct: "MAC addresses at the data-link layer", distractors: ["IP addresses at the network layer", "Port numbers at the transport layer", "Domain names"], solution: "A Layer-2 switch learns and forwards by MAC address." },
  { topic: "Computer Networks", difficulty: "easy", stem: "DNS is responsible for:", correct: "Translating domain names to IP addresses", distractors: ["Encrypting web traffic", "Assigning MAC addresses", "Routing between subnets"], solution: "The Domain Name System resolves human-readable names to IP addresses." },
  { topic: "Computer Networks", difficulty: "easy", stem: "The well-known TCP port for unencrypted HTTP is:", correct: "80", distractors: ["443", "21", "25"], solution: "HTTP uses port 80; HTTPS uses 443." },
  // Digital logic / computer organisation
  { topic: "Digital Logic", difficulty: "easy", stem: "Which logic gate outputs 1 only when all inputs are 1?", correct: "AND", distractors: ["OR", "NAND", "XOR"], solution: "AND gives 1 only when every input is 1." },
  { topic: "Digital Logic", difficulty: "medium", stem: "The NAND and NOR gates are called universal gates because they can:", correct: "Implement any Boolean function", distractors: ["Only invert signals", "Only store data", "Work without power"], solution: "Any logic function can be built using only NAND (or only NOR) gates." },
  { topic: "Digital Logic", difficulty: "medium", stem: "A flip-flop is a circuit that can store:", correct: "One bit of information", distractors: ["One byte", "Eight bits", "No information"], solution: "A flip-flop is a basic 1-bit memory element." },
  { topic: "Computer Organization", difficulty: "medium", stem: "Cache memory is used because it is:", correct: "Faster than main memory, reducing access time", distractors: ["Larger than main memory", "Non-volatile storage", "Slower but cheaper"], solution: "Cache is small, fast memory holding frequently used data near the CPU." },
  { topic: "Computer Organization", difficulty: "medium", stem: "In the Von Neumann architecture, instructions and data:", correct: "Share the same memory", distractors: ["Use physically separate memories", "Are never stored", "Reside only in registers"], solution: "Von Neumann machines store programs and data in one common memory (Harvard uses separate)." },
  { topic: "Computer Organization", difficulty: "easy", stem: "RAM is described as volatile memory because it:", correct: "Loses its contents when power is removed", distractors: ["Retains data without power", "Can only be read", "Is part of the disk"], solution: "Volatile memory needs power to keep data; RAM clears on power-off." },
  // Number systems / programming
  { topic: "Number Systems", difficulty: "easy", stem: "The base (radix) of the hexadecimal number system is:", correct: "16", distractors: ["2", "8", "10"], solution: "Hexadecimal uses 16 symbols (0–9, A–F)." },
  { topic: "Number Systems", difficulty: "medium", stem: "In an n-bit two's-complement representation, the number of distinct values is:", correct: "2ⁿ", distractors: ["2ⁿ − 1", "n²", "2n"], solution: "n bits encode 2ⁿ distinct values, from −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1." },
  { topic: "Programming", difficulty: "medium", stem: "A compiler differs from an interpreter in that it:", correct: "Translates the whole program before execution", distractors: ["Executes line by line at run time", "Cannot detect syntax errors", "Produces no output file"], solution: "A compiler produces object/machine code ahead of time; an interpreter executes statements directly." },
  { topic: "Programming", difficulty: "medium", stem: "Encapsulation in object-oriented programming refers to:", correct: "Bundling data with the methods that operate on it", distractors: ["Reusing code via inheritance", "Many forms of one interface", "Hiding the compiler"], solution: "Encapsulation groups state and behaviour and restricts direct access to internals." },
  { topic: "Programming", difficulty: "medium", stem: "Polymorphism in OOP allows:", correct: "One interface to take many forms", distractors: ["Only single inheritance", "Data to be public always", "Code to skip compilation"], solution: "Polymorphism lets the same call behave differently depending on the object's type." },
  { topic: "Programming", difficulty: "easy", stem: "A pointer variable stores:", correct: "The memory address of another variable", distractors: ["A floating-point value", "A character string only", "The size of a type"], solution: "Pointers hold addresses, enabling indirect access and dynamic structures." },
];

// ─── Hard CS theory (conceptual) ─────────────────────────────────────────────
const SYS_HARD_THEORY: FactQ[] = [
  { topic: "Algorithms", difficulty: "hard", stem: "Quicksort attains its O(n²) worst case when:", correct: "The pivot is consistently the smallest or largest element", distractors: ["The array is large but random", "Recursion depth is balanced", "The pivot is always the median"], solution: "Maximally unbalanced partitions (e.g. sorted input with first/last pivot) give O(n²)." },
  { topic: "Data Structures", difficulty: "hard", stem: "B-trees are preferred over binary search trees for on-disk databases because they:", correct: "Are shallow (high fan-out), reducing disk accesses", distractors: ["Use less memory per node", "Are always balanced binary trees", "Avoid sorting entirely"], solution: "High branching factor keeps B-trees shallow, minimizing expensive disk seeks." },
  { topic: "Algorithms", difficulty: "hard", stem: "To find shortest paths when some edge weights are negative (but no negative cycle), use:", correct: "Bellman–Ford", distractors: ["Dijkstra", "Prim's", "Kruskal's"], solution: "Bellman–Ford handles negative edges and detects negative cycles; Dijkstra cannot." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Belady's anomaly — more frames causing more page faults — can occur with which replacement policy?", correct: "FIFO", distractors: ["Optimal (OPT)", "LRU", "MRU"], solution: "FIFO can exhibit Belady's anomaly; stack algorithms like LRU and OPT cannot." },
  { topic: "Operating Systems", difficulty: "hard", stem: "The Banker's algorithm is used for deadlock:", correct: "Avoidance", distractors: ["Detection only", "Prevention by spooling", "Recovery by rollback"], solution: "It checks whether granting a request leaves the system in a safe state (avoidance)." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Which condition is NOT one of the four necessary conditions for deadlock?", correct: "Preemption of resources", distractors: ["Mutual exclusion", "Hold and wait", "Circular wait"], solution: "Deadlock needs mutual exclusion, hold-and-wait, NO preemption, and circular wait — so 'preemption' is not a condition." },
  { topic: "DBMS", difficulty: "hard", stem: "Two-phase locking (2PL) guarantees:", correct: "Conflict-serializable schedules", distractors: ["Deadlock freedom", "No lost updates without logging", "Maximum concurrency always"], solution: "2PL (growing then shrinking phase) ensures serializability, though deadlocks are still possible." },
  { topic: "DBMS", difficulty: "hard", stem: "A relation in BCNF is also in 3NF, but the converse may fail when:", correct: "A non-key attribute determines part of a candidate key", distractors: ["There are no functional dependencies", "All attributes are keys", "The relation has one attribute"], solution: "BCNF is stricter: every determinant must be a superkey; 3NF allows certain prime-attribute dependencies." },
  { topic: "Computer Networks", difficulty: "hard", stem: "The TCP connection is established using a:", correct: "Three-way handshake (SYN, SYN-ACK, ACK)", distractors: ["Two-way handshake", "Four-way handshake", "One-way SYN"], solution: "TCP setup uses SYN → SYN-ACK → ACK; teardown uses a four-way exchange." },
  { topic: "Computer Networks", difficulty: "hard", stem: "Given the network 192.168.1.0/26, the number of usable host addresses per subnet is:", correct: "62", distractors: ["64", "30", "126"], solution: "/26 leaves 6 host bits ⇒ 2⁶ − 2 = 62 usable hosts (minus network and broadcast)." },
  { topic: "Computer Organization", difficulty: "hard", stem: "In a 5-stage instruction pipeline, a data hazard arises when:", correct: "An instruction needs a result not yet produced by an earlier instruction", distractors: ["Two instructions are independent", "The clock is too slow", "There are no branches"], solution: "Data hazards occur from dependencies; they are mitigated by forwarding or stalls." },
  { topic: "Computer Organization", difficulty: "hard", stem: "In a direct-mapped cache, each main-memory block can be placed in:", correct: "Exactly one cache line", distractors: ["Any cache line", "Any of two lines", "Two specific lines"], solution: "Direct mapping fixes each block to one line (block mod #lines), unlike associative caches." },
  { topic: "Theory of Computation", difficulty: "hard", stem: "For every nondeterministic finite automaton (NFA) there exists:", correct: "An equivalent deterministic finite automaton (DFA)", distractors: ["No equivalent DFA", "Only an equivalent pushdown automaton", "Only an equivalent Turing machine"], solution: "NFAs and DFAs recognize exactly the same (regular) languages — the subset construction proves it." },
  { topic: "Theory of Computation", difficulty: "hard", stem: "A problem that is NP-complete is:", correct: "In NP and at least as hard as every NP problem", distractors: ["Solvable in polynomial time for sure", "Not in NP", "Always undecidable"], solution: "NP-complete = in NP and NP-hard; a polynomial solution to one would solve all of NP." },
  { topic: "Algorithms", difficulty: "hard", stem: "Inserting n elements into a dynamic array that doubles on resize has an amortized insertion cost of:", correct: "O(1) per insertion", distractors: ["O(n) per insertion", "O(log n) per insertion", "O(n²) total"], solution: "Doubling makes total work O(n) over n inserts, i.e. amortized O(1) each." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Demand paging brings a page into memory:", correct: "Only when it is first referenced (causing a page fault)", distractors: ["At program load time, all at once", "Never during execution", "Only on program exit"], solution: "Pages are loaded lazily on first access; the page fault triggers the load." },
  { topic: "Data Structures", difficulty: "hard", stem: "Searching a skewed (degenerate) binary search tree of n nodes takes, in the worst case:", correct: "O(n)", distractors: ["O(log n)", "O(1)", "O(n log n)"], solution: "A fully skewed BST behaves like a linked list, giving O(n) search." },
];

// ─── Tricky conceptual pool (INCORRECT / compare / limiting) ─────────────────
const SYS_TRICKY_POOL: FactQ[] = [
  { topic: "Algorithms", difficulty: "hard", stem: "Which statement is INCORRECT?", correct: "Binary search works on an unsorted array", distractors: ["Binary search requires a sorted array", "Binary search runs in O(log n)", "Linear search works on unsorted arrays"], solution: "Binary search only works on sorted data — the claim that it works unsorted is false." },
  { topic: "Algorithms", difficulty: "hard", stem: "Which comparison of sorting algorithms is correct?", correct: "Merge sort is stable; standard quicksort is not", distractors: ["Quicksort is stable; merge sort is not", "Both are always stable", "Neither is comparison-based"], solution: "Merge sort preserves equal-key order (stable); typical quicksort does not." },
  { topic: "Algorithms", difficulty: "hard", stem: "Which sorting algorithm is in-place (O(1) extra space)?", correct: "Quicksort", distractors: ["Merge sort (array version)", "Counting sort", "Radix sort"], solution: "Quicksort sorts within the array; standard merge sort needs O(n) auxiliary space." },
  { topic: "Data Structures", difficulty: "hard", stem: "The worst-case lookup time of a hash table (all keys colliding) is:", correct: "O(n)", distractors: ["O(1)", "O(log n)", "O(n log n)"], solution: "If every key hashes to the same bucket, lookup degrades to scanning a list — O(n)." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Which of the following is NOT a necessary condition for deadlock?", correct: "Resource preemption is allowed", distractors: ["Mutual exclusion", "Hold and wait", "Circular wait"], solution: "Deadlock requires NO preemption; allowing preemption actually prevents deadlock." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Which statement about processes and threads is INCORRECT?", correct: "Threads of the same process have separate heaps", distractors: ["Threads share the process's code and data", "Each thread has its own stack", "Context switching between threads is cheaper than between processes"], solution: "Threads share the heap; only stacks and registers are per-thread." },
  { topic: "Computer Networks", difficulty: "hard", stem: "Which statement about TCP and UDP is INCORRECT?", correct: "UDP guarantees in-order, reliable delivery", distractors: ["TCP is connection-oriented", "UDP has lower overhead than TCP", "TCP uses acknowledgements"], solution: "UDP is best-effort with no ordering or reliability guarantees." },
  { topic: "DBMS", difficulty: "hard", stem: "Which statement about keys is INCORRECT?", correct: "A primary key may contain null values", distractors: ["A primary key is unique", "A foreign key can be null", "A table can have multiple candidate keys"], solution: "A primary key must be non-null and unique." },
  { topic: "Number Systems", difficulty: "hard", stem: "For large n, which growth ordering is correct?", correct: "2ⁿ grows faster than n²", distractors: ["n² grows faster than 2ⁿ", "log n grows faster than n", "n! grows slower than 2ⁿ"], solution: "Exponential 2ⁿ eventually dominates any polynomial like n²." },
  { topic: "Digital Logic", difficulty: "hard", stem: "Which statement is correct?", correct: "Any Boolean function can be built using only NAND gates", distractors: ["AND gates alone are universal", "OR gates alone are universal", "XOR gates alone are universal"], solution: "NAND (and NOR) are the universal gates; AND/OR/XOR alone are not functionally complete." },
  { topic: "Number Systems", difficulty: "hard", stem: "In 8-bit two's complement, the range of representable integers is:", correct: "−128 to +127", distractors: ["−127 to +128", "0 to 255", "−128 to +128"], solution: "8-bit two's complement spans −2⁷ to 2⁷ − 1 = −128 to +127." },
  { topic: "Data Structures", difficulty: "hard", stem: "Which statement about a singly linked list is correct?", correct: "It does not support O(1) random access by index", distractors: ["It supports O(1) random access", "It uses contiguous memory", "Its size must be fixed at creation"], solution: "Linked lists require O(n) traversal to reach an arbitrary index — no random access." },
  { topic: "Algorithms", difficulty: "hard", stem: "Which statement about greedy algorithms is correct?", correct: "They do not always yield a globally optimal solution", distractors: ["They always yield the optimum", "They are the same as dynamic programming", "They never work for optimization"], solution: "Greedy choices are optimal only for problems with the greedy-choice property (e.g. MST); not in general." },
  { topic: "Operating Systems", difficulty: "hard", stem: "Which statement about virtual memory is INCORRECT?", correct: "Page faults are handled entirely by the CPU without disk access", distractors: ["A page fault may load a page from disk", "Virtual memory can exceed physical RAM", "The page table maps pages to frames"], solution: "A page fault for a non-resident page requires the OS to fetch it from disk." },
  { topic: "Programming", difficulty: "hard", stem: "Which statement comparing compilation and interpretation is correct?", correct: "Compiled code generally runs faster than interpreted code", distractors: ["Interpreted code is always faster", "Compilers cannot report errors", "Interpreters produce machine-code files"], solution: "Ahead-of-time compiled native code typically executes faster than line-by-line interpretation." },
];

// ─── CS numerical generators (parametric) ────────────────────────────────────
const SYS_NUM_GENERATORS: SpecGen[] = [
  // Binary to decimal
  (rand) => {
    const n = pick(rand, [5, 6, 7, 9, 10, 11, 12, 13, 14, 15]);
    const bin = n.toString(2);
    return {
      topic: "Number Systems", difficulty: "easy",
      stem: `The decimal value of the binary number ${bin}₂ is:`,
      correct: `${n}`, distractors: [`${n + 1}`, `${n - 1}`, `${n + 2}`],
      solution: `${bin}₂ = ${n}₁₀ (sum of place values).`,
    };
  },
  // Decimal to binary
  (rand) => {
    const n = pick(rand, [10, 12, 18, 20, 25, 27, 33, 40]);
    const bin = n.toString(2);
    return {
      topic: "Number Systems", difficulty: "easy",
      stem: `The binary representation of decimal ${n} is:`,
      correct: `${bin}₂`, distractors: [`${(n + 1).toString(2)}₂`, `${(n - 1).toString(2)}₂`, `${(n + 2).toString(2)}₂`],
      solution: `${n}₁₀ = ${bin}₂.`,
    };
  },
  // Hex to decimal
  (rand) => {
    const n = pick(rand, [10, 15, 26, 31, 47, 64, 100, 160, 255]);
    const hex = n.toString(16).toUpperCase();
    return {
      topic: "Number Systems", difficulty: "medium",
      stem: `The decimal value of the hexadecimal number ${hex}₁₆ is:`,
      correct: `${n}`, distractors: [`${n + 1}`, `${n - 1}`, `${n + 16}`],
      solution: `${hex}₁₆ = ${n}₁₀.`,
    };
  },
  // Two's complement count
  (rand) => {
    const b = pick(rand, [4, 6, 8, 10, 12]);
    const v = Math.pow(2, b);
    return {
      topic: "Number Systems", difficulty: "medium",
      stem: `An ${b}-bit register can represent how many distinct values?`,
      correct: `${v}`, distractors: [`${v - 1}`, `${v / 2}`, `${b * b}`],
      solution: `${b} bits give 2^${b} = ${v} distinct patterns.`,
    };
  },
  // Full binary tree nodes
  (rand) => {
    const h = pick(rand, [3, 4, 5, 6]);
    const v = Math.pow(2, h) - 1;
    return {
      topic: "Data Structures", difficulty: "medium",
      stem: `A perfect binary tree of height ${h} (root at height 1) has how many nodes?`,
      correct: `${v}`, distractors: [`${Math.pow(2, h)}`, `${v - 1}`, `${2 * h}`],
      solution: `Nodes = 2^h − 1 = 2^${h} − 1 = ${v}.`,
    };
  },
  // Address bits for memory size
  (rand) => {
    const kb = pick(rand, [1, 2, 4, 8, 16, 64]); // K words
    const bits = Math.log2(kb * 1024);
    return {
      topic: "Computer Organization", difficulty: "medium",
      stem: `How many address lines are needed to address ${kb}K memory locations?`,
      correct: `${bits}`, distractors: [`${bits - 1}`, `${bits + 1}`, `${bits + 2}`],
      solution: `${kb}K = ${kb * 1024} = 2^${bits}, so ${bits} address lines are required.`,
    };
  },
  // Subnet usable hosts
  (rand) => {
    const hostBits = pick(rand, [3, 4, 5, 6, 8]);
    const usable = Math.pow(2, hostBits) - 2;
    const prefix = 32 - hostBits;
    return {
      topic: "Computer Networks", difficulty: "medium",
      stem: `A /${prefix} IPv4 subnet provides how many usable host addresses?`,
      correct: `${usable}`, distractors: [`${usable + 2}`, `${usable + 1}`, `${Math.pow(2, hostBits - 1) - 2}`],
      solution: `Host bits = 32 − ${prefix} = ${hostBits}; usable = 2^${hostBits} − 2 = ${usable}.`,
    };
  },
  // Binary search comparisons
  (rand) => {
    const k = pick(rand, [4, 5, 6, 7, 8, 10]);
    const n = Math.pow(2, k);
    return {
      topic: "Algorithms", difficulty: "medium",
      stem: `Binary search on a sorted array of ${n} elements needs at most how many comparisons?`,
      correct: `${k}`, distractors: [`${k + 1}`, `${k - 1}`, `${n / 2}`],
      solution: `Worst-case comparisons ≈ ⌈log₂ ${n}⌉ = ${k}.`,
    };
  },
  // Bubble sort comparisons
  (rand) => {
    const n = pick(rand, [5, 6, 8, 10]);
    const c = (n * (n - 1)) / 2;
    return {
      topic: "Algorithms", difficulty: "medium",
      stem: `The maximum number of comparisons made by bubble sort on ${n} elements is:`,
      correct: `${c}`, distractors: [`${n * n}`, `${n * (n - 1)}`, `${c + n}`],
      solution: `Bubble sort makes n(n−1)/2 = ${n}×${n - 1}/2 = ${c} comparisons.`,
    };
  },
  // Bytes for bits
  (rand) => {
    const bits = pick(rand, [16, 24, 32, 48, 64]);
    const bytes = bits / 8;
    return {
      topic: "Computer Organization", difficulty: "easy",
      stem: `A data word of ${bits} bits occupies how many bytes?`,
      correct: `${bytes}`, distractors: [`${bytes * 2}`, `${bytes + 1}`, `${bits}`],
      solution: `${bits} bits ÷ 8 = ${bytes} bytes.`,
    };
  },
  // Cache hit ratio effective access (simple)
  (rand) => {
    const h = pick(rand, [0.8, 0.9, 0.95]);
    const tc = pick(rand, [10, 20]);
    const tm = pick(rand, [100, 200]);
    const eat = r2(h * tc + (1 - h) * tm);
    return {
      topic: "Computer Organization", difficulty: "medium",
      stem: `Cache access = ${tc} ns, memory access = ${tm} ns, hit ratio = ${h}. The effective access time is:`,
      correct: `${eat} ns`, distractors: [`${r2((tc + tm) / 2)} ns`, `${r2(h * tm)} ns`, `${r2(eat + 10)} ns`],
      solution: `EAT = h·tc + (1−h)·tm = ${h}×${tc} + ${r2(1 - h)}×${tm} = ${eat} ns.`,
    };
  },
  // Page offset bits
  (rand) => {
    const ps = pick(rand, [1, 2, 4, 8]); // KB
    const bits = Math.log2(ps * 1024);
    return {
      topic: "Operating Systems", difficulty: "medium",
      stem: `With a page size of ${ps} KB, the number of bits used for the page offset is:`,
      correct: `${bits}`, distractors: [`${bits - 1}`, `${bits + 1}`, `${bits + 2}`],
      solution: `${ps}KB = 2^${bits} bytes, so the offset field is ${bits} bits.`,
    };
  },
  // Disk transfer / throughput
  (rand) => {
    const mb = pick(rand, [100, 200, 500]);
    const rate = pick(rand, [50, 100, 250]); // MB/s
    const t = r2(mb / rate);
    return {
      topic: "Operating Systems", difficulty: "easy",
      stem: `Transferring ${mb} MB at ${rate} MB/s takes about:`,
      correct: `${t} s`, distractors: [`${r2(rate / mb)} s`, `${r2(t * 2)} s`, `${r2(t + 1)} s`],
      solution: `time = size/rate = ${mb}/${rate} = ${t} s.`,
    };
  },
  // Hash table load factor
  (rand) => {
    const n = pick(rand, [30, 45, 60, 75]);
    const m = pick(rand, [50, 100]);
    const lf = r2(n / m);
    return {
      topic: "Data Structures", difficulty: "easy",
      stem: `A hash table with ${m} slots holds ${n} keys. Its load factor is:`,
      correct: `${lf}`, distractors: [`${r2(m / n)}`, `${r2(lf * 2)}`, `${r2(lf + 0.2)}`],
      solution: `Load factor α = n/m = ${n}/${m} = ${lf}.`,
    };
  },
];

// ─── Hard CS numerical generators (multi-step) ───────────────────────────────
const SYS_HARD_NUM: SpecGen[] = [
  // Effective access time with page fault
  (rand) => {
    const ma = pick(rand, [100, 200]); // ns
    const pf = pick(rand, [0.001, 0.002]); // fault rate
    const ft = pick(rand, [8, 10]); // ms fault service
    const eat = r1(ma * (1 - pf) + pf * ft * 1e6);
    return {
      topic: "Operating Systems", difficulty: "hard",
      stem: `Memory access = ${ma} ns, page-fault rate = ${pf}, fault service = ${ft} ms. The effective access time is about:`,
      correct: `${eat} ns`, distractors: [`${r1(ma)} ns`, `${r1(eat / 2)} ns`, `${r1(eat * 2)} ns`],
      solution: `EAT = (1−p)·ma + p·service = ${r2(1 - pf)}×${ma} + ${pf}×${ft}ms ≈ ${eat} ns (faults dominate).`,
    };
  },
  // Pipeline speedup
  (rand) => {
    const stages = pick(rand, [4, 5, 6]);
    const n = pick(rand, [100, 1000]);
    const sp = r2((n * stages) / (stages + n - 1));
    return {
      topic: "Computer Organization", difficulty: "hard",
      stem: `An ideal ${stages}-stage pipeline processes ${n} instructions. The speedup over a non-pipelined CPU is about:`,
      correct: `${sp}`, distractors: [`${stages}`, `${r2(sp / 2)}`, `${r2(sp + 1)}`],
      solution: `Speedup = n·k/(k + n − 1) = ${n}×${stages}/(${stages}+${n}−1) ≈ ${sp} (→ k for large n).`,
    };
  },
  // Two's complement value of pattern
  (rand) => {
    const bits = 8;
    const raw = pick(rand, [200, 220, 240, 250, 130, 160]);
    const val = raw >= 128 ? raw - 256 : raw;
    const binv = raw.toString(2).padStart(8, "0");
    return {
      topic: "Number Systems", difficulty: "hard",
      stem: `Interpreted as an 8-bit two's-complement number, the bit pattern ${binv} equals:`,
      correct: `${val}`, distractors: [`${raw}`, `${val + 1}`, `${-raw}`],
      solution: `MSB = 1 ⇒ negative; value = ${raw} − 256 = ${val}.`,
    };
  },
  // Subnet count from borrowed bits
  (rand) => {
    const borrowed = pick(rand, [2, 3, 4]);
    const subnets = Math.pow(2, borrowed);
    const hostBits = 8 - borrowed;
    const hosts = Math.pow(2, hostBits) - 2;
    return {
      topic: "Computer Networks", difficulty: "hard",
      stem: `Borrowing ${borrowed} bits from the host portion of a class-C network yields how many subnets, each with how many usable hosts?`,
      correct: `${subnets} subnets, ${hosts} hosts`, distractors: [`${subnets} subnets, ${hosts + 2} hosts`, `${subnets * 2} subnets, ${hosts} hosts`, `${subnets} subnets, ${Math.pow(2, hostBits)} hosts`],
      solution: `Subnets = 2^${borrowed} = ${subnets}; host bits = ${hostBits} ⇒ 2^${hostBits} − 2 = ${hosts} hosts each.`,
    };
  },
  // TLB effective access
  (rand) => {
    const tlb = pick(rand, [10, 20]);
    const mem = pick(rand, [100, 200]);
    const hit = pick(rand, [0.9, 0.95]);
    const eat = r2(hit * (tlb + mem) + (1 - hit) * (tlb + 2 * mem));
    return {
      topic: "Operating Systems", difficulty: "hard",
      stem: `TLB access = ${tlb} ns, memory access = ${mem} ns, TLB hit ratio = ${hit} (paged memory). The effective access time is about:`,
      correct: `${eat} ns`, distractors: [`${r2(tlb + mem)} ns`, `${r2(mem)} ns`, `${r2(eat + 20)} ns`],
      solution: `EAT = h(tlb+mem) + (1−h)(tlb+2·mem) = ${hit}(${tlb}+${mem}) + ${r2(1 - hit)}(${tlb}+${2 * mem}) ≈ ${eat} ns.`,
    };
  },
  // Recurrence solution count (Fibonacci-ish growth) — number of leaf calls
  (rand) => {
    const n = pick(rand, [4, 5, 6, 7]);
    // T(n)=T(n-1)+T(n-2)+1, count of base-case calls = fib(n+1)
    const fib = (k: number): number => (k < 2 ? k : fib(k - 1) + fib(k - 2));
    const calls = fib(n + 1);
    return {
      topic: "Algorithms", difficulty: "hard",
      stem: `Naive recursive Fibonacci fib(${n}) (with fib(0)=0, fib(1)=1) makes how many calls to the base cases fib(0) or fib(1)?`,
      correct: `${calls}`, distractors: [`${n}`, `${calls + 1}`, `${2 * n}`],
      solution: `The number of base-case calls for fib(n) equals fib(n+1) = ${calls}, illustrating exponential blow-up.`,
    };
  },
  // Memory for 2D array
  (rand) => {
    const rows = pick(rand, [50, 100, 200]);
    const cols = pick(rand, [20, 40, 80]);
    const sz = pick(rand, [4, 8]);
    const total = (rows * cols * sz) / 1024;
    return {
      topic: "Data Structures", difficulty: "hard",
      stem: `A ${rows}×${cols} array of ${sz}-byte elements occupies how much memory?`,
      correct: `${r2(total)} KB`, distractors: [`${r2(total / 2)} KB`, `${r2(total * 2)} KB`, `${r2(rows * cols / 1024)} KB`],
      solution: `Size = rows×cols×bytes = ${rows}×${cols}×${sz} = ${rows * cols * sz} B = ${r2(total)} KB.`,
    };
  },
  // Bandwidth-delay product
  (rand) => {
    const bw = pick(rand, [1, 10, 100]); // Mbps
    const rtt = pick(rand, [20, 50, 100]); // ms
    const bdp = r2((bw * 1e6 * rtt * 1e-3) / 8 / 1024);
    return {
      topic: "Computer Networks", difficulty: "hard",
      stem: `A link of ${bw} Mbps has a round-trip time of ${rtt} ms. The bandwidth-delay product is about:`,
      correct: `${bdp} KB`, distractors: [`${r2(bdp / 2)} KB`, `${r2(bdp * 2)} KB`, `${r2(bw * rtt)} KB`],
      solution: `BDP = bandwidth×delay = ${bw}Mbps×${rtt}ms ÷ 8 ≈ ${bdp} KB.`,
    };
  },
];

// ─── Graphical (SVG) CS figure generators ────────────────────────────────────
const svg = (markup: string): { kind: "svg"; markup: string } => ({ kind: "svg", markup });

const SYS_FIGURE_GENERATORS: ((rand: () => number) => FactQ)[] = [
  // Binary search tree → in-order traversal
  (rand) => {
    const root = pick(rand, [40, 50, 60]);
    const l = root - pick(rand, [15, 20, 25]);
    const r = root + pick(rand, [15, 20, 25]);
    const ll = l - pick(rand, [5, 8]);
    const lr = l + pick(rand, [5, 8]);
    const inorder = [ll, l, lr, root, r].join(", ");
    const markup = `<svg viewBox="0 0 260 150" width="260" height="150"><line x1="130" y1="30" x2="80" y2="75" stroke="#475569" stroke-width="1.5"/><line x1="130" y1="30" x2="190" y2="75" stroke="#475569" stroke-width="1.5"/><line x1="80" y1="75" x2="50" y2="120" stroke="#475569" stroke-width="1.5"/><line x1="80" y1="75" x2="110" y2="120" stroke="#475569" stroke-width="1.5"/><circle cx="130" cy="30" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="130" y="34" font-size="11" text-anchor="middle">${root}</text><circle cx="80" cy="75" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="80" y="79" font-size="11" text-anchor="middle">${l}</text><circle cx="190" cy="75" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="190" y="79" font-size="11" text-anchor="middle">${r}</text><circle cx="50" cy="120" r="16" fill="#dcfce7" stroke="#16a34a"/><text x="50" y="124" font-size="11" text-anchor="middle">${ll}</text><circle cx="110" cy="120" r="16" fill="#dcfce7" stroke="#16a34a"/><text x="110" y="124" font-size="11" text-anchor="middle">${lr}</text></svg>`;
    return {
      topic: "Data Structures", difficulty: "medium",
      stem: `For the binary search tree shown (root ${root}), the in-order traversal sequence is:`,
      correct: inorder, distractors: [[root, l, r, ll, lr].join(", "), [ll, lr, l, r, root].join(", "), [root, r, l, lr, ll].join(", ")],
      solution: `In-order (left–root–right) of a BST gives ascending order: ${inorder}.`,
      figure: { ...svg(markup), caption: "Binary search tree" },
    };
  },
  // Logic gate → output
  (rand) => {
    const gate = pick(rand, ["AND", "OR", "NAND", "NOR", "XOR"]);
    const a = pick(rand, [0, 1]);
    const b = pick(rand, [0, 1]);
    const out =
      gate === "AND" ? a & b :
      gate === "OR" ? a | b :
      gate === "NAND" ? 1 - (a & b) :
      gate === "NOR" ? 1 - (a | b) :
      a ^ b;
    const markup = `<svg viewBox="0 0 220 110" width="220" height="110"><line x1="10" y1="35" x2="70" y2="35" stroke="#1e293b" stroke-width="2"/><line x1="10" y1="75" x2="70" y2="75" stroke="#1e293b" stroke-width="2"/><text x="6" y="30" font-size="11" fill="#2563eb">A=${a}</text><text x="6" y="92" font-size="11" fill="#2563eb">B=${b}</text><path d="M70 20 L110 20 Q150 55 110 90 L70 90 Z" fill="#f1f5f9" stroke="#475569" stroke-width="1.5"/><text x="95" y="60" font-size="11" text-anchor="middle" fill="#475569">${gate}</text><line x1="150" y1="55" x2="200" y2="55" stroke="#1e293b" stroke-width="2"/><text x="180" y="48" font-size="11" fill="#dc2626">?</text></svg>`;
    return {
      topic: "Digital Logic", difficulty: "medium",
      stem: `For the ${gate} gate shown with inputs A = ${a} and B = ${b}, the output is:`,
      correct: `${out}`, distractors: [`${1 - out}`, `${a}`, `${b}`],
      solution: `${gate}(${a}, ${b}) = ${out}.`,
      figure: { ...svg(markup), caption: `${gate} gate` },
    };
  },
  // Stack operations → top element
  (rand) => {
    const seq = [pick(rand, [3, 5, 7]), pick(rand, [8, 9, 11]), pick(rand, [12, 14, 20])];
    // push a,b,c; pop; push d → top = d
    const d = pick(rand, [21, 25, 30]);
    const top = d;
    const markup = `<svg viewBox="0 0 220 130" width="220" height="130"><rect x="80" y="20" width="60" height="24" fill="#fee2e2" stroke="#dc2626"/><text x="110" y="37" font-size="11" text-anchor="middle">${d}</text><rect x="80" y="44" width="60" height="24" fill="#dbeafe" stroke="#2563eb"/><text x="110" y="61" font-size="11" text-anchor="middle">${seq[1]}</text><rect x="80" y="68" width="60" height="24" fill="#dbeafe" stroke="#2563eb"/><text x="110" y="85" font-size="11" text-anchor="middle">${seq[0]}</text><line x1="78" y1="20" x2="78" y2="92" stroke="#475569" stroke-width="2"/><line x1="142" y1="20" x2="142" y2="92" stroke="#475569" stroke-width="2"/><line x1="78" y1="92" x2="142" y2="92" stroke="#475569" stroke-width="2"/><text x="150" y="30" font-size="10" fill="#dc2626">← top</text></svg>`;
    return {
      topic: "Data Structures", difficulty: "medium",
      stem: `Operations on an empty stack: push ${seq[0]}, push ${seq[1]}, push ${seq[2]}, pop, push ${d}. The element now on top is:`,
      correct: `${top}`, distractors: [`${seq[2]}`, `${seq[1]}`, `${seq[0]}`],
      solution: `After push ${seq[2]} then pop (removes ${seq[2]}), pushing ${d} leaves ${d} on top (LIFO).`,
      figure: { ...svg(markup), caption: "Stack state" },
    };
  },
  // Graph → BFS order
  (rand) => {
    const start = pick(rand, ["A"]);
    // fixed small graph A-B, A-C, B-D, C-D; BFS from A = A B C D
    const order = pick(rand, [["A", "B", "C", "D"]]);
    const markup = `<svg viewBox="0 0 220 140" width="220" height="140"><line x1="40" y1="30" x2="160" y2="30" stroke="#475569" stroke-width="1.5"/><line x1="40" y1="30" x2="40" y2="110" stroke="#475569" stroke-width="1.5"/><line x1="160" y1="30" x2="160" y2="110" stroke="#475569" stroke-width="1.5"/><line x1="40" y1="110" x2="160" y2="110" stroke="#475569" stroke-width="1.5"/><circle cx="40" cy="30" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="40" y="34" font-size="11" text-anchor="middle">A</text><circle cx="160" cy="30" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="160" y="34" font-size="11" text-anchor="middle">B</text><circle cx="40" cy="110" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="40" y="114" font-size="11" text-anchor="middle">C</text><circle cx="160" cy="110" r="16" fill="#dbeafe" stroke="#2563eb"/><text x="160" y="114" font-size="11" text-anchor="middle">D</text></svg>`;
    return {
      topic: "Algorithms", difficulty: "medium",
      stem: `In the graph shown (edges A–B, A–C, B–D, C–D), a breadth-first search from ${start}, visiting neighbours alphabetically, gives the order:`,
      correct: order.join(", "), distractors: [["A", "C", "B", "D"].join(", "), ["A", "B", "D", "C"].join(", "), ["A", "D", "B", "C"].join(", ")],
      solution: `BFS from A visits A, then its neighbours B and C, then D: ${order.join(", ")}.`,
      figure: { ...svg(markup), caption: "Undirected graph (4 nodes)" },
    };
  },
  // Truth table → function
  (rand) => {
    const fn = pick(rand, ["AND", "OR", "XOR"]);
    const rows = [0, 1, 2, 3].map((i) => {
      const a = (i >> 1) & 1, b = i & 1;
      const y = fn === "AND" ? a & b : fn === "OR" ? a | b : a ^ b;
      return { a, b, y };
    });
    const body = rows
      .map((row, i) => `<text x="30" y="${55 + i * 20}" font-size="11">${row.a}</text><text x="70" y="${55 + i * 20}" font-size="11">${row.b}</text><text x="120" y="${55 + i * 20}" font-size="11" fill="#dc2626">${row.y}</text>`)
      .join("");
    const markup = `<svg viewBox="0 0 170 150" width="170" height="150"><text x="26" y="35" font-size="11" font-weight="bold">A</text><text x="66" y="35" font-size="11" font-weight="bold">B</text><text x="112" y="35" font-size="11" font-weight="bold">Y</text><line x1="20" y1="40" x2="150" y2="40" stroke="#475569"/>${body}</svg>`;
    return {
      topic: "Digital Logic", difficulty: "medium",
      stem: `The truth table shown (output Y) corresponds to which logic function of A and B?`,
      correct: fn, distractors: [["AND", "OR", "XOR"].filter((g) => g !== fn)[0], ["AND", "OR", "XOR"].filter((g) => g !== fn)[1], "NAND"],
      solution: `Reading the output column identifies the function as ${fn}.`,
      figure: { ...svg(markup), caption: "Truth table" },
    };
  },
];

// ─── Paper-II assembly (60 theory + 40 numerical, 3:2 interleave) ────────────
function genProfessional(rand: () => number, startId: number, setNo: number, tough: boolean): Q[] {
  const out: Q[] = [];
  const hardTheory = SYS_HARD_THEORY;
  const baseTheory = SYS_THEORY_POOL;
  const theorySlice: FactQ[] = tough
    ? [
        ...rotateSlice(SYS_TRICKY_POOL, setNo, 8, 7),
        ...rotateSlice(hardTheory, setNo, 12, 11),
        ...rotateSlice(baseTheory, setNo, 40, 44),
      ]
    : [
        ...rotateSlice(hardTheory, setNo, 16, 11),
        ...rotateSlice(baseTheory, setNo, 44, 44),
      ];
  shuffleInPlace(rand, theorySlice);

  const figItems = drawDistinct(rand, SYS_FIGURE_GENERATORS, 12);
  const numItems: FactQ[] = [
    ...figItems,
    ...fillSpecs(rand, SYS_HARD_NUM, SYS_NUM_GENERATORS, 28, tough ? 10 : 6),
  ];
  shuffleInPlace(rand, numItems);

  const merged: FactQ[] = [];
  let ti = 0;
  let ni = 0;
  for (let k = 0; k < 100; k++) {
    const wantNum = k % 5 === 2 || k % 5 === 4;
    if (wantNum && ni < numItems.length) merged.push(numItems[ni++]);
    else if (ti < theorySlice.length) merged.push(theorySlice[ti++]);
    else if (ni < numItems.length) merged.push(numItems[ni++]);
  }
  merged.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + i,
      subject: SUBJ.prof,
      topic: f.topic,
      section: "Paper-II",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
      figure: f.figure,
    });
  });
  return out;
}

runDiscipline({
  slug: "system",
  discipline: "System",
  seedBase: 0x2121000,
  genProfessional,
});
