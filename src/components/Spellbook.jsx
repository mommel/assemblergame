import React, { useState } from "react";
import "../Spellbook.css";

export default function Spellbook({ spells = [] }) {
  const [pageIndex, setPageIndex] = useState(0);

  const spell = spells[pageIndex];
  const canGoLeft = pageIndex > 0;
  const canGoRight = pageIndex < spells.length - 1;

  const defaults = {  
    school: "Assembler",
    range: "7-12 Meter",
    cast: "1 Aktion",
    mana: 42,
  };

  const goLeft = () => {
    if (canGoLeft) setPageIndex((prev) => prev - 1);
  };

  const goRight = () => {
    if (canGoRight) setPageIndex((prev) => prev + 1);
  };

  return (
    <div className="spellbook-shell">
      <div className="spellbook-label">Arcane Spellbook</div>

      <button
        className="spellbook-nav spellbook-navLeft"
        onClick={goLeft}
        disabled={!canGoLeft}
        aria-label="Vorheriger Spell"
        type="button"
      >
        ‹
      </button>

      <div className="spellbook-book">
        <div className="spellbook-page current">
          <div className="spellbook-pageInner">
            {
              <>
                <div className="spellbook-top">
                  <div className="spellbook-imageWrap">
                    <img
                      className="spellbook-image"
                      src={`/src/assets/${spell.title}.jpg`}
                      alt={spell.title}
                    />
                  </div>

                  <div className="spellbook-header">
                    <h2 className="titletext spellbook-title">{spell.title}</h2>
                    <div className="buttonstext spellbook-school">{defaults.school}</div>

                    <ul className="buttonstext spellbook-meta">
                      <li><strong>Level:</strong> {spell.level}</li>
                      <li><strong>Mana:</strong> {defaults.mana}</li>
                      <li><strong>Cast:</strong> {defaults.cast}</li>
                      <li><strong>Range:</strong> {defaults.range}</li>
                    </ul>
                  </div>
                </div>

                <p className="spellbook-description descriptiontext">{spell.description}</p>
                <div className="spellbook-pageNumber buttonstext bigfont">Seite {pageIndex + 1}</div>
              </>
            }
          </div>
        </div>
      </div>

      <button
        className="spellbook-nav spellbook-navRight"
        onClick={goRight}
        disabled={!canGoRight}
        aria-label="Nächster Spell"
        type="button"
      >
        ›
      </button>
    </div>
  );
}