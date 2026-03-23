/**
 * Minimal Assembly Interpreter
 * 
 * Registers: R1, R2, R3, R4, ACC
 * Flags: EQUAL, GREATER, LESS
 * I/O: inputQueue, outputQueue
 */

export class Interpreter {
  constructor() {
    this.reset();
  }

  reset() {
    this.registers = { R1: 0, R2: 0, R3: 0, R4: 0, ACC: 0 };
    this.flags = { EQUAL: false, GREATER: false, LESS: false };
    this.inputQueue = [];
    this.outputQueue = [];
    this.pc = 0; // Program Counter (line number, 0-indexed)
    this.instructions = [];
    this.cycleCount = 0;
    this.error = null;
    this.done = false;
  }

  load(code, inputs = []) {
    this.reset();
    this.inputQueue = [...inputs];
    // Split by lines, remove comments and empty lines, keep original line mapping
    this.instructions = code.split('\n').map((line, index) => {
      let trimmed = line.split('//')[0].trim().toUpperCase();
      return { text: trimmed, originalLine: index };
    });
  }

  getValue(operand) {
    if (this.registers.hasOwnProperty(operand)) {
      return this.registers[operand];
    }
    const val = parseInt(operand, 10);
    if (isNaN(val)) throw new Error(`Invalid operand: ${operand}`);
    return val;
  }

  step() {
    if (this.done || this.error) return;
    
    // Find next non-empty instruction
    while (this.pc < this.instructions.length && this.instructions[this.pc].text === '') {
      this.pc++;
    }

    if (this.pc >= this.instructions.length) {
      this.done = true;
      return;
    }

    const currentLine = this.instructions[this.pc];
    const parts = currentLine.text.split(/[\s,]+/);
    const cmd = parts[0];
    const arg1 = parts[1];
    const arg2 = parts[2];

    try {
      this.cycleCount++;
      switch (cmd) {
        case 'MOV': // MOV dest, src
          if (!this.registers.hasOwnProperty(arg1)) throw new Error(`Invalid destination register: ${arg1}`);
          this.registers[arg1] = this.getValue(arg2);
          this.pc++;
          break;
        case 'ADD': // ADD val/reg -> adds to ACC
          this.registers.ACC += this.getValue(arg1);
          this.pc++;
          break;
        case 'SUB': // SUB val/reg -> subs from ACC
          this.registers.ACC -= this.getValue(arg1);
          this.pc++;
          break;
        case 'CMP': // CMP val/reg -> compares with ACC
          const val = this.getValue(arg1);
          this.flags.EQUAL = this.registers.ACC === val;
          this.flags.GREATER = this.registers.ACC > val;
          this.flags.LESS = this.registers.ACC < val;
          this.pc++;
          break;
        case 'JMP': // JMP line (1-indexed for user friendliness)
          this.pc = this.getValue(arg1) - 1;
          break;
        case 'JEQ': // JEQ line
          if (this.flags.EQUAL) this.pc = this.getValue(arg1) - 1;
          else this.pc++;
          break;
        case 'JGT': // JGT line
          if (this.flags.GREATER) this.pc = this.getValue(arg1) - 1;
          else this.pc++;
          break;
        case 'JLT': // JLT line
          if (this.flags.LESS) this.pc = this.getValue(arg1) - 1;
          else this.pc++;
          break;
        case 'IN': // IN -> reads input queue to ACC
          if (this.inputQueue.length === 0) {
            this.done = true; // Natural termination on empty queue like Human Resource Machine
            break;
          }
          this.registers.ACC = this.inputQueue.shift();
          this.pc++;
          break;
        case 'OUT': // OUT -> writes ACC to output queue
          this.outputQueue.push(this.registers.ACC);
          this.pc++;
          break;
        default:
          throw new Error(`Unknown instruction: ${cmd}`);
      }
    } catch (err) {
      this.error = `Error on line ${currentLine.originalLine + 1}: ${err.message}`;
      this.done = true;
    }
  }

  runAll(maxCycles = 1000) {
    while (!this.done && !this.error && this.cycleCount < maxCycles) {
      this.step();
    }
    if (this.cycleCount >= maxCycles) {
      this.error = 'Maximum cycle count exceeded (Infinite loop?)';
    }
  }
}
