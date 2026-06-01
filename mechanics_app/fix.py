import os

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old not in content:
            print(f"WARNING: '{old[:50]}...' not found in {path}")
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {path}")

p_replacements = [
    (
        "['A','H'], ['H','C'], ['C','F'], ['F','E'],",
        "['A','H'], ['B','G'], ['D','G'], ['F','E'],"
    ),
    (
        '''        /* ── Joint B ─────────────────────────────────────────────────
           ΣFy: −L − BH = 0  → BH = L (C)
           ΣFx: −AB + BC = 0 → BC = AB = 7L/2 (C)
        */
        const BH_val = L;
        const BC_val = AB_val;

        /* ── Joint D (symmetric with B) ─────────────────────────────
           DF = L (C),  CD = 7L/2 (C)
        */
        const DF_val = L;
        const CD_val = AB_val;

        /* ── Joint H ─────────────────────────────────────────────────
           AH=T, BH=C. Directions from H: →A(−1/√2,+1/√2), →B(0,+1), →C(+1/√2,+1/√2), →G(+1,0)
           ΣFy: AH/√2 − BH + HC/√2 = 0
                3L/2 − L + HC/√2 = 0  → HC = −L/√2 = −L√2/2  (C)
           ΣFx: −AH/√2 + HC/√2 + HG = 0
                −3L/2 − L/2 + HG = 0  → HG = 2L  (T)
        */
        const HC_val = (L * sq2) / 2;  // magnitude (C)
        const HG_val = 2 * L;

        /* ── Joint F (symmetric with H) ─────────────────────────────
           CF = L√2/2 (C),  GF = 2L (T)
        */
        const CF_val = HC_val;
        const GF_val = 2 * L;

        /* ── CG = 0 (zero-force member) ─────────────────────────────
           Joint G: HG pulls left, GF pulls right equally → ΣFy: CG = 0
        */
        const CG_val = 0;''',
        '''        /* ── Joint H ─────────────────────────────────────────────────
           AH=T (pulls up-left).
           ΣFy: AH/√2 + BH = 0  → 1.5L + BH = 0  → BH = 1.5L (C)
           ΣFx: -AH/√2 + HG = 0 → -1.5L + HG = 0 → HG = 1.5L (T)
        */
        const BH_val = 1.5 * L;
        const HG_val = 1.5 * L;

        /* ── Joint B ─────────────────────────────────────────────────
           AB=C (pushes right), BH=C (pushes up).
           ΣFy: BH - L - BG/√2 = 0 → 1.5L - L - BG/√2 = 0 → BG = 0.5√2 L (T)
           ΣFx: AB + BC + BG/√2 = 0 → 3.5L + BC + 0.5L = 0 → BC = 4L (C)
        */
        const BG_val = 0.5 * sq2 * L;
        const BC_val = 4 * L;

        /* ── Joint C ─────────────────────────────────────────────────
           BC=C (pushes right). No diagonals at C.
           ΣFy: -L - CG = 0 → CG = L (C)
           ΣFx: BC + CD = 0 → 4L + CD = 0 → CD = 4L (C)
        */
        const CG_val = L;
        const CD_val = 4 * L;

        /* ── Symmetry (Joints D, F, G) ──────────────────────────────
           By symmetry, right side matches left side.
        */
        const DF_val = BH_val;
        const GF_val = HG_val;
        const DG_val = BG_val;'''
    ),
    (
        '''          <div class="ans-box compression" id="box-HC"><div class="lbl">HC</div><div class="val" id="ans-HC">—</div><div class="note" id="note-HC">—</div></div>
          <div class="ans-box compression" id="box-CF"><div class="lbl">CF</div><div class="val" id="ans-CF">—</div><div class="note" id="note-CF">—</div></div>''',
        '''          <div class="ans-box tension" id="box-BG"><div class="lbl">BG</div><div class="val" id="ans-BG">—</div><div class="note" id="note-BG">—</div></div>
          <div class="ans-box tension" id="box-DG"><div class="lbl">DG</div><div class="val" id="ans-DG">—</div><div class="note" id="note-DG">—</div></div>'''
    ),
    (
        "set('ans-CG','box-CG', fmtZ(), 'zero');",
        "set('ans-CG','box-CG', fmtC(CG_val,'Compression (C)'), 'compression');"
    ),
    (
        "set('ans-HC','box-HC', fmtC(HC_val,'Compression (C)'), 'compression');",
        "set('ans-BG','box-BG', fmtC(BG_val,'Tension (T)'), 'tension');"
    ),
    (
        "set('ans-CF','box-CF', fmtC(CF_val,'Compression (C)'), 'compression');",
        "set('ans-DG','box-DG', fmtC(DG_val,'Tension (T)'), 'tension');"
    ),
    (
        "document.getElementById('fs-CG').textContent = '0 (zero)';",
        "document.getElementById('fs-CG').textContent = fmt1(CG_val) + ' C';"
    ),
    (
        '''          { n:4, b:`<span class="eq">Joint B → BH (C), BC (C)</span>

ΣFy: −${sL} − BH = 0  →  <span class="comp">BH = ${n(BH_val)}  C</span>
ΣFx: BC = AB  →  <span class="comp">BC = ${n(BC_val)}  C</span>` },
          { n:5, b:`<span class="eq">Joint D → DF (C), CD (C)</span>  [symmetric with B]

  <span class="comp">DF = ${n(DF_val)}  C</span>
  <span class="comp">CD = ${n(CD_val)}  C</span>` },
          { n:6, b:`<span class="eq">Joint H → HC (C), HG (T)</span>

ΣFy: 3${sL}/2 − ${sL} + HC/√2 = 0
  <span class="comp">HC = ${sL}√2/2 = ${n(HC_val)}  C</span>
ΣFx: −3${sL}/2 − ${sL}/2 + HG = 0
  <span class="tens">HG = 2${sL} = ${n(HG_val)}  T</span>` },
          { n:7, b:`<span class="eq">Joint F → CF (C), GF (T)</span>  [symmetric with H]

  <span class="comp">CF = ${sL}√2/2 = ${n(CF_val)}  C</span>
  <span class="tens">GF = 2${sL} = ${n(GF_val)}  T</span>` },
          { n:8, b:`<span class="eq">Joint G / Joint C — verify CG</span>

At G: HG (←T), GF (→T), CG (↑)
  ΣFx: −2${sL} + 2${sL} = 0 ✓
  ΣFy: CG = 0  → <span class="zero">CG = 0  (Zero-force member)</span>

Verify at C: HC and CF each supply ${sL}/2 upward
  → ${sL}/2 + ${sL}/2 = ${sL} balances applied load ✓` },
          { n:9, b:`<span class="eq">All 13 Members — Summary</span>

Top chord (C):  <span class="comp">AB=BC=CD=DE = 7${sL}/2 = ${n(AB_val)}</span>
Bot chord (T):  <span class="tens">HG=GF = 2${sL} = ${n(HG_val)}</span>
Verticals (C):  <span class="comp">BH=DF = ${sL} = ${n(BH_val)}</span>
Vertical  (0):  <span class="zero">CG = 0  (zero-force)</span>
Diag out  (T):  <span class="tens">AH=FE = 3√2${sL}/2 = ${n(AH_val)}</span>
Diag in   (C):  <span class="comp">HC=CF = ${sL}√2/2 = ${n(HC_val)}</span>` }''',
        '''          { n:4, b:`<span class="eq">Joint H → BH (C), HG (T)</span>

ΣFy: AH/√2 + BH = 0  →  <span class="comp">BH = 1.5${sL} = ${n(BH_val)}  C</span>
ΣFx: -AH/√2 + HG = 0  →  <span class="tens">HG = 1.5${sL} = ${n(HG_val)}  T</span>` },
          { n:5, b:`<span class="eq">Joint B → BG (T), BC (C)</span>

ΣFy: BH − ${sL} − BG/√2 = 0
  <span class="tens">BG = ${sL}√2/2 = ${n(BG_val)}  T</span>
ΣFx: AB + BC + BG/√2 = 0
  <span class="comp">BC = 4${sL} = ${n(BC_val)}  C</span>` },
          { n:6, b:`<span class="eq">Joint C → CG (C), CD (C)</span>

ΣFy: −${sL} − CG = 0  →  <span class="comp">CG = ${sL} = ${n(CG_val)}  C</span>
ΣFx: BC + CD = 0  →  <span class="comp">CD = 4${sL} = ${n(CD_val)}  C</span>` },
          { n:7, b:`<span class="eq">Joints D, F, G (Symmetry)</span>

  <span class="comp">CD=DE=4${sL}, 3.5${sL}  C</span>
  <span class="comp">DF = 1.5${sL} = ${n(DF_val)}  C</span>
  <span class="tens">DG = ${sL}√2/2 = ${n(DG_val)}  T</span>
  <span class="tens">GF = 1.5${sL} = ${n(GF_val)}  T</span>` },
          { n:8, b:`<span class="eq">Verification at Joint G</span>

At G: HG (←T), GF (→T), CG (↓C), BG (↖T), DG (↗T)
  ΣFx: −1.5${sL} − 0.5${sL} + 0.5${sL} + 1.5${sL} = 0 ✓
  ΣFy: −${sL} (from CG) + 0.5${sL} + 0.5${sL} = 0 ✓` },
          { n:9, b:`<span class="eq">All 13 Members — Summary</span>

Top chord (C):  <span class="comp">AB=DE = 3.5${sL}, BC=CD = 4${sL}</span>
Bot chord (T):  <span class="tens">HG=GF = 1.5${sL} = ${n(HG_val)}</span>
Verticals (C):  <span class="comp">BH=DF = 1.5${sL}, CG = ${sL}</span>
Diag out  (T):  <span class="tens">AH=FE = 1.5√2${sL} = ${n(AH_val)}</span>
Diag in   (T):  <span class="tens">BG=DG = 0.5√2${sL} = ${n(BG_val)}</span>` }'''
    )
]

b_replacements = [
    (
        '''   |╲       |        |        |       /|
   | ╲      |        |        |      / |
   |  ╲     |        |        |     /  |
   |   ╲    |        |        |    /   |
   |    H───────────G────────────F     |   ← Bot chord (y = -d)''',
        '''   |╲       |╲      /|       /|
   | ╲      | ╲    / |      / |
   |  ╲     |  ╲  /  |     /  |
   |   ╲    |   ╲/   |    /   |
   |    H────────G────────F   |   ← Bot chord (y = -d)'''
    ),
    (
        '''        <tr><td>Diagonals</td><td>AH, HC, CF, FE</td><td>4</td><td>45°</td></tr>''',
        '''        <tr><td>Diagonals</td><td>AH, BG, DG, EF</td><td>4</td><td>45°</td></tr>'''
    ),
    (
        '''Member <strong>CG = 0</strong> is identified as a zero-force member from joint G inspection.''',
        '''Member <strong>CG</strong> supports the full load at joint C directly.''',
    ),
    (
        '''    <h3>Joint B → Members BH (C) and BC (C)</h3>
    <p>External at B: load = L (↓). Members: AB, BC (horizontal), BH (vertical ↓).</p>
    <div class="formula">
      ΣF<sub>y</sub> = 0: −L + BH·(−1) = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>BH = L (C)</strong>
    </div>
    <div class="formula">
      ΣF<sub>x</sub> = 0: BC = AB&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>BC = 7L/2 (C)</strong>
    </div>

    <h3>Joint D → Members DF (C) and CD (C)</h3>
    <p>By symmetry with joint B: <strong>DF = L (C)</strong> and <strong>CD = 7L/2 (C)</strong>.</p>

    <div class="page-num">2</div>
  </div>


  <!-- ═══════════════════════════════════════════
     PAGE 3  — JOINTS H, F, G AND RESULTS
════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header-line">Problem 4/22 — Loaded Truss Solver · Rathanga Parthasarathy</div>

    <h2><span class="sec-num">§ 6</span> Joints H, F and G</h2>

    <h3>Joint H → Members HC (C) and HG (T)</h3>
    <p>Known: AH = 3√2L/2 (T), BH = L (C).
    Directions from H: to A = (−1/√2, +1/√2), to B = (0,+1), to C = (+1/√2,+1/√2), to G = (+1,0).</p>
    <div class="formula">
      ΣF<sub>y</sub>: 3L/2 − L + HC/√2 = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>HC = L√2/2 (C)</strong>
    </div>
    <div class="formula">
      ΣF<sub>x</sub>: −3L/2 − L/2 + HG = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>HG = 2L (T)</strong>
    </div>

    <h3>Joint F → Members CF (C) and GF (T)</h3>
    <p>By symmetry with joint H: <strong>CF = L√2/2 (C)</strong> and <strong>GF = 2L (T)</strong>.</p>

    <h3>Joint G → CG is a Zero-Force Member</h3>
    <p>At joint G, members HG (pulls left, T) and GF (pulls right, T) are equal and opposite.
    Member CG is vertical. With no external load at G:</p>
    <div class="formula">
      ΣF<sub>x</sub> = 0: −2L + 2L = 0 ✓
    </div>
    <div class="formula">
      ΣF<sub>y</sub> = 0: CG = 0 &nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>CG = 0 (zero-force)</strong>
    </div>

    <div class="callout">
      <div class="callout-title">Verification at Joint C</div>
      The diagonal members HC and CF each supply an upward vertical component of L/√2 × 1/√2 = L/2.
      Together, L/2 + L/2 = L, which exactly balances the applied downward load L at C. ✓
      The zero value of CG is confirmed.
    </div>''',
        '''    <h3>Joint H → Members BH (C) and HG (T)</h3>
    <p>Known: AH = 3√2L/2 (T).
    Directions from H: to A = (−1/√2, +1/√2), to B = (0,+1), to G = (+1,0).</p>
    <div class="formula">
      ΣF<sub>y</sub> = 0: AH/√2 + BH = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>BH = 3L/2 (C)</strong>
    </div>
    <div class="formula">
      ΣF<sub>x</sub> = 0: −AH/√2 + HG = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>HG = 3L/2 (T)</strong>
    </div>

    <div class="page-num">2</div>
  </div>


  <!-- ═══════════════════════════════════════════
     PAGE 3  — JOINTS B, C, G AND RESULTS
════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header-line">Problem 4/22 — Loaded Truss Solver · Rathanga Parthasarathy</div>

    <h2><span class="sec-num">§ 6</span> Joints B, C, and G</h2>

    <h3>Joint B → Members BG (T) and BC (C)</h3>
    <p>Known: AB = 7L/2 (C), BH = 3L/2 (C).</p>
    <div class="formula">
      ΣF<sub>y</sub> = 0: BH − L − BG/√2 = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>BG = L√2/2 (T)</strong>
    </div>
    <div class="formula">
      ΣF<sub>x</sub> = 0: AB + BC + BG/√2 = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>BC = 4L (C)</strong>
    </div>

    <h3>Joint C → Members CG (C) and CD (C)</h3>
    <p>Known: BC = 4L (C). No diagonals at C.</p>
    <div class="formula">
      ΣF<sub>y</sub> = 0: −L − CG = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>CG = L (C)</strong>
    </div>
    <div class="formula">
      ΣF<sub>x</sub> = 0: BC + CD = 0&nbsp;&nbsp;⟹&nbsp;&nbsp;<strong>CD = 4L (C)</strong>
    </div>

    <div class="callout">
      <div class="callout-title">Verification at Joint G</div>
      At joint G, horizontal equilibrium: −HG − BG/√2 + DG/√2 + GF = 0.
      Vertical equilibrium: −CG + BG/√2 + DG/√2 = 0 ⟹ −L + L/2 + L/2 = 0 ✓.
      The compression of CG perfectly balances the upward pull of diagonals BG and DG.
    </div>'''
    ),
    (
        '''    <h4>Top Chord (Compression)</h4>
    <div class="member-grid">
      <div class="member-card comp"><div class="m-name">AB</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">BC</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">CD</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">DE</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
    </div>

    <h4>Bottom Chord (Tension)</h4>
    <div class="member-grid" style="grid-template-columns: repeat(2,1fr);">
      <div class="member-card tens"><div class="m-name">HG</div><div class="m-val">20.00 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card tens"><div class="m-name">GF</div><div class="m-val">20.00 kN</div><div class="m-type">Tension</div></div>
    </div>

    <h4>Verticals</h4>
    <div class="member-grid" style="grid-template-columns: repeat(3,1fr);">
      <div class="member-card comp"><div class="m-name">BH</div><div class="m-val">10.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card zero"><div class="m-name">CG</div><div class="m-val">0</div><div class="m-type">Zero-force</div></div>
      <div class="member-card comp"><div class="m-name">DF</div><div class="m-val">10.00 kN</div><div class="m-type">Compression</div></div>
    </div>

    <h4>Diagonals</h4>
    <div class="member-grid">
      <div class="member-card tens"><div class="m-name">AH</div><div class="m-val">21.21 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card comp"><div class="m-name">HC</div><div class="m-val">7.07 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">CF</div><div class="m-val">7.07 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card tens"><div class="m-name">FE</div><div class="m-val">21.21 kN</div><div class="m-type">Tension</div></div>
    </div>''',
        '''    <h4>Top Chord (Compression)</h4>
    <div class="member-grid">
      <div class="member-card comp"><div class="m-name">AB</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">BC</div><div class="m-val">40.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">CD</div><div class="m-val">40.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">DE</div><div class="m-val">35.00 kN</div><div class="m-type">Compression</div></div>
    </div>

    <h4>Bottom Chord (Tension)</h4>
    <div class="member-grid" style="grid-template-columns: repeat(2,1fr);">
      <div class="member-card tens"><div class="m-name">HG</div><div class="m-val">15.00 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card tens"><div class="m-name">GF</div><div class="m-val">15.00 kN</div><div class="m-type">Tension</div></div>
    </div>

    <h4>Verticals</h4>
    <div class="member-grid" style="grid-template-columns: repeat(3,1fr);">
      <div class="member-card comp"><div class="m-name">BH</div><div class="m-val">15.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">CG</div><div class="m-val">10.00 kN</div><div class="m-type">Compression</div></div>
      <div class="member-card comp"><div class="m-name">DF</div><div class="m-val">15.00 kN</div><div class="m-type">Compression</div></div>
    </div>

    <h4>Diagonals</h4>
    <div class="member-grid">
      <div class="member-card tens"><div class="m-name">AH</div><div class="m-val">21.21 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card tens"><div class="m-name">BG</div><div class="m-val">7.07 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card tens"><div class="m-name">DG</div><div class="m-val">7.07 kN</div><div class="m-type">Tension</div></div>
      <div class="member-card tens"><div class="m-name">FE</div><div class="m-val">21.21 kN</div><div class="m-type">Tension</div></div>
    </div>'''
    ),
    (
        '''Step 3 — Joint B
  ΣFy: −10000 − BH = 0  →  <span class="fn">BH = 10000 N (C)</span>
  ΣFx: BC = AB          →  <span class="fn">BC = 35000 N (C)</span>

Step 4 — Joint H
  ΣFy: 15000 − 10000 + HC/√2 = 0  →  HC = −7071.1 N → <span class="fn">HC = 7071.1 N (C)</span>
  ΣFx: −15000 − 7071.1/√2 + HG = 0  →  <span class="fn">HG = 20000 N (T)</span>

Step 5 — Joint G
  ΣFy: CG = 0  →  <span class="fn">CG = 0 (zero-force)</span>

Steps 6,7,8 — By symmetry (D, F, E) give CD, DF, GF, CF, FE, DE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Top chord  AB=BC=CD=DE : <span class="num">35.00 kN (C)</span>
  Bot chord  HG=GF       : <span class="num">20.00 kN (T)</span>
  Verticals  BH=DF       : <span class="num">10.00 kN (C)</span>
  Vertical   CG          : <span class="fn">0         (zero-force)</span>
  Diag outer AH=FE       : <span class="num">21.21 kN (T)</span>
  Diag inner HC=CF       : <span class="num"> 7.07 kN (C)</span>''',
        '''Step 3 — Joint H
  ΣFy: 15000 + BH = 0  →  <span class="fn">BH = 15000 N (C)</span>
  ΣFx: −15000 + HG = 0 →  <span class="fn">HG = 15000 N (T)</span>

Step 4 — Joint B
  ΣFy: 15000 − 10000 − BG/√2 = 0  →  <span class="fn">BG = 7071.1 N (T)</span>
  ΣFx: 35000 + BC + 5000 = 0      →  <span class="fn">BC = 40000 N (C)</span>

Step 5 — Joint C
  ΣFy: −10000 − CG = 0  →  <span class="fn">CG = 10000 N (C)</span>
  ΣFx: 40000 + CD = 0   →  <span class="fn">CD = 40000 N (C)</span>

Steps 6,7,8 — By symmetry (D, F, E) give DF, GF, DG, FE, DE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Top chord  AB=DE=35, BC=CD=40: <span class="num">kN (C)</span>
  Bot chord  HG=GF       : <span class="num">15.00 kN (T)</span>
  Verticals  BH=DF=15, CG=10: <span class="num">kN (C)</span>
  Diag outer AH=FE       : <span class="num">21.21 kN (T)</span>
  Diag inner BG=DG       : <span class="num"> 7.07 kN (T)</span>'''
    ),
    (
        '''    <div class="callout green">
      <div class="callout-title">Zero-Force Member Detection</div>
      Member CG is identified analytically (not by inspection of only horizontal members) by solving
      joint G after HG and GF are determined. Since HG = GF = 2L, they cancel in ΣFx, leaving ΣFy: CG = 0.
      The solver correctly identifies this — an important correction to the textbook's "by inspection" shortcut
      which fails when diagonal members (HC, CF) are also present at joint C.
    </div>''',
        '''    <div class="callout green">
      <div class="callout-title">Corrected Truss Diagonals</div>
      Unlike some alternative truss layouts, the standard problem 4/22 utilizes diagonals AH, BG, DG, and EF.
      Because of this geometry, joint C has no diagonals, meaning the vertical member CG must carry the entire applied load L in compression.
    </div>'''
    )
]

replace_in_file(r'c:\Users\Rathanga Sarathy\OneDrive\Desktop\AI\mechanics_app\problem_4_22.html', p_replacements)
replace_in_file(r'c:\Users\Rathanga Sarathy\OneDrive\Desktop\AI\mechanics_app\blueprint_4_22.html', b_replacements)
