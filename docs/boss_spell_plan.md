# Boss-Spell-Plan (Assembler Funktionen)

Basis-Repertoire von Start an: `IN`, `OUT`, `JMP`.

| Boss | Benötigte Funktionen im Kampf | Neu benötigt ab Boss | Vor Kampf verfügbar | Reward nach Sieg |
|---|---|---|---|---|
| 1 | IN, OUT, JMP | IN, OUT, JMP | IN, OUT, JMP | ADD |
| 2 | IN, ADD, OUT, JMP | ADD | IN, OUT, JMP, ADD | SUB |
| 3 | IN, SUB, OUT, JMP | SUB | IN, OUT, JMP, ADD, SUB | MOV |
| 4 | IN, MOV, ADD, OUT, JMP | MOV | IN, OUT, JMP, ADD, SUB, MOV | CMP |
| 5 | IN, MOV, ADD, OUT, JMP | CMP (erst ab Boss 6 benötigt) | IN, OUT, JMP, ADD, SUB, MOV, CMP | JEQ |
| 6 | IN, CMP, JEQ, MOV, OUT, JMP | CMP, JEQ | IN, OUT, JMP, ADD, SUB, MOV, CMP, JEQ | JGT |
| 7 | IN, CMP, JGT, JMP, OUT | JGT | IN, OUT, JMP, ADD, SUB, MOV, CMP, JEQ, JGT | JLT |
| 8 | IN, CMP, JLT, JMP, OUT | JLT | IN, OUT, JMP, ADD, SUB, MOV, CMP, JEQ, JGT, JLT | - |
| 9-30 | Keine neuen Befehle nötig | - | Alle Befehle freigeschaltet | - |

Hinweis: Die benötigten Funktionen basieren auf den hinterlegten Referenzlösungen der Level.