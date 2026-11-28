import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rosterPath = path.join(root, "src/assets/animations/rig-roster.json");
const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));
// A denser deformable surface gives the independent limb bones enough vertices to
// bend the original transparent PNG around joints instead of moving a coarse 9x9 card.
// Keep the two-influence Spine mesh format supported by Rigby2D.
const GRID = 17;

const bone = (name, x, y, length = 0) => ({ name, x, y, length });

function makeRigBones(character, width, height, isBoss) {
  const w = width, h = height;
  const profile = character.motionProfile || "";
  const biped = /biped|humanoid|knight|wrapped|rat|ogre|hopper|frog|leaper/.test(profile);
  const winged = /wing|fly|hover/.test(profile);
  const quadruped = /quadruped|lizard|turtle|crawler|wolf|reptile/.test(profile);
  const tentacle = /tentacle|octopus|jelly|ghost|cloud/.test(profile);
  const fish = /fish|swim/.test(profile);
  const crab = /crab|multi-leg/.test(profile);
  const round = /round|cube|soft|floating/.test(profile);

  let parts;
  if (biped || (!winged && !quadruped && !tentacle && !fish && !crab && !round)) {
    parts = [
      bone("pelvis", 0, -h * 0.24, h * 0.22),
      bone("torso", 0, h * 0.015, h * 0.34),
      bone("head", 0, h * 0.32, h * 0.2),
      bone("upperarm_l", -w * 0.29, h * 0.08, h * 0.2),
      bone("forearm_l", -w * 0.34, -h * 0.04, h * 0.14),
      bone("upperarm_r", w * 0.29, h * 0.08, h * 0.2),
      bone("forearm_r", w * 0.34, -h * 0.04, h * 0.14),
      bone("thigh_l", -w * 0.14, -h * 0.25, h * 0.2),
      bone("shin_l", -w * 0.14, -h * 0.39, h * 0.12),
      bone("thigh_r", w * 0.14, -h * 0.25, h * 0.2),
      bone("shin_r", w * 0.14, -h * 0.39, h * 0.12),
    ];
  } else if (quadruped) {
    parts = [
      bone("body", 0, 0, h * 0.34),
      bone("head", w * 0.28, h * 0.13, h * 0.18),
      bone("front_leg_l", w * 0.24, -h * 0.2, h * 0.22),
      bone("front_leg_r", w * 0.08, -h * 0.2, h * 0.22),
      bone("back_leg_l", -w * 0.23, -h * 0.2, h * 0.22),
      bone("back_leg_r", -w * 0.08, -h * 0.2, h * 0.22),
      bone("tail", -w * 0.38, h * 0.04, h * 0.2),
      ...(winged ? [
        bone("wing_l", -w * 0.28, h * 0.2, w * 0.32),
        bone("wing_r", w * 0.28, h * 0.2, w * 0.32),
      ] : []),
    ];
  } else if (winged) {
    parts = [
      bone("body", 0, 0, h * 0.32),
      bone("head", 0, h * 0.22, h * 0.16),
      bone("wing_l", -w * 0.27, h * 0.1, w * 0.35),
      bone("wing_r", w * 0.27, h * 0.1, w * 0.35),
      bone("leg_l", -w * 0.12, -h * 0.28, h * 0.12),
      bone("leg_r", w * 0.12, -h * 0.28, h * 0.12),
    ];
  } else if (tentacle) {
    parts = [
      bone("core", 0, h * 0.05, h * 0.28),
      ...Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI + (Math.PI * (i + 0.5)) / 6;
        return bone(`tentacle_${i + 1}`, Math.cos(a) * w * 0.2, Math.sin(a) * h * 0.18, h * 0.22);
      }),
      bone("crown", 0, h * 0.32, h * 0.14),
    ];
  } else if (fish) {
    parts = [
      bone("body", 0, 0, h * 0.32),
      bone("head", w * 0.28, h * 0.02, h * 0.14),
      bone("tail", -w * 0.38, 0, w * 0.22),
      bone("fin_top", -w * 0.02, h * 0.28, h * 0.14),
      bone("fin_bottom", -w * 0.02, -h * 0.28, h * 0.14),
    ];
  } else if (crab) {
    parts = [
      bone("shell", 0, h * 0.08, h * 0.28),
      bone("claw_l", -w * 0.34, h * 0.04, w * 0.2),
      bone("claw_r", w * 0.34, h * 0.04, w * 0.2),
      ...Array.from({ length: 6 }, (_, i) => bone(`leg_${i + 1}`, (i < 3 ? -1 : 1) * w * (0.18 + (i % 3) * 0.06), -h * 0.18, h * 0.14)),
    ];
  } else {
    parts = [
      bone("core", 0, 0, h * 0.3),
      bone("top", 0, h * 0.3, h * 0.14),
      bone("left", -w * 0.28, 0, h * 0.18),
      bone("right", w * 0.28, 0, h * 0.18),
      bone("base", 0, -h * 0.3, h * 0.14),
    ];
  }

  if (isBoss) parts.push(bone("aura", 0, 0, h * 0.48));
  return [bone("root", 0, 0), ...parts];
}

function chooseAnimation(character, bones, characterHeight, isBoss) {
  const profile = character.motionProfile || "";
  const names = bones.map((b) => b.name);
  const has = (n) => names.includes(n);
  const timelines = {};
  const addRotate = (name, values) => {
    if (!has(name)) return;
    timelines[name] ||= {};
    timelines[name].rotate = values.map(([time, value]) => ({ time, value }));
  };
  const addTranslate = (name, values) => {
    if (!has(name)) return;
    timelines[name] ||= {};
    timelines[name].translate = values.map(([time, x, y]) => ({ time, x, y }));
  };
  const addScale = (name, values) => {
    if (!has(name)) return;
    timelines[name] ||= {};
    timelines[name].scale = values.map(([time, x, y]) => ({ time, x, y }));
  };
  const clip = (name, length, build) => {
    Object.keys(timelines).forEach((key) => delete timelines[key]);
    build();
    const bonesOut = JSON.parse(JSON.stringify(timelines));
    return { name, duration: length, bones: bonesOut };
  };
  const pair = (left, right, amount, t = 0.5) => {
    addRotate(left, [[0, -amount], [t, amount], [t * 2, -amount]]);
    addRotate(right, [[0, amount], [t, -amount], [t * 2, amount]]);
  };
  const soft = /floating|cloud|jelly|tentacle|fish|hover/.test(profile);
  const limbPairs = names.includes("thigh_l") ? [["thigh_l","thigh_r"],["upperarm_l","upperarm_r"]] :
    names.includes("front_leg_l") ? [["front_leg_l","back_leg_r"],["front_leg_r","back_leg_l"]] :
    names.includes("wing_l") ? [["wing_l","wing_r"]] :
    names.includes("leg_1") ? [["leg_1","leg_4"],["leg_2","leg_5"],["leg_3","leg_6"]] :
    names.includes("tail") ? [["tail","head"]] :
    names.includes("tentacle_1") ? [["tentacle_1","tentacle_4"],["tentacle_2","tentacle_5"],["tentacle_3","tentacle_6"]] :
    names.includes("left") ? [["left","right"]] : [];

  const secondaryLimbPairs = [
    ["forearm_l", "forearm_r"],
    ["shin_l", "shin_r"],
  ].filter(([left, right]) => has(left) && has(right));

  const clips = [];
  clips.push(clip("idle", 1.2, () => {
    addRotate(has("head") ? "head" : has("crown") ? "crown" : "core", [[0,-1.5],[0.6,1.5],[1.2,-1.5]]);
    addRotate(has("torso") ? "torso" : has("body") ? "body" : "core", [[0,0],[0.6,1],[1.2,0]]);
    if (soft && has("aura")) addScale("aura", [[0,1,1],[0.6,1.035,1.035],[1.2,1,1]]);
    if (has("tail")) addRotate("tail", [[0,-3],[0.6,3],[1.2,-3]]);
    if (has("wing_l")) addRotate("wing_l", [[0,-5],[0.6,5],[1.2,-5]]);
    if (has("wing_r")) addRotate("wing_r", [[0,5],[0.6,-5],[1.2,5]]);
  }));
  // Ambient personality clips play only while the hero is outside the enemy's awareness radius.
  // Biped rigs can visibly raise their arms; other anatomies use their own head, tail,
  // wing, fin, claw, or tentacle bones for species-appropriate idle activity.
  clips.push(clip("idle-phone", 1.12, () => {
    addRotate("upperarm_l", [[0,0],[0.22,-38],[0.82,-38],[1.12,0]]);
    addRotate("forearm_l", [[0,0],[0.22,62],[0.82,62],[1.12,0]]);
    addRotate("head", [[0,0],[0.22,9],[0.82,9],[1.12,0]]);
    addRotate("torso", [[0,0],[0.22,2],[0.82,2],[1.12,0]]);
    addRotate("body", [[0,0],[0.22,2],[0.82,2],[1.12,0]]);
    addRotate("core", [[0,0],[0.22,3],[0.82,3],[1.12,0]]);
    if (has("tail")) addRotate("tail", [[0,-2],[0.56,3],[1.12,-2]]);
  }));
  clips.push(clip("idle-scratch", 1.04, () => {
    addRotate("upperarm_r", [[0,0],[0.2,58],[0.76,58],[1.04,0]]);
    addRotate("forearm_r", [[0,0],[0.2,-78],[0.76,-78],[1.04,0]]);
    addRotate("head", [[0,0],[0.2,-8],[0.52,5],[0.82,-8],[1.04,0]]);
    addRotate("torso", [[0,0],[0.2,-2],[0.76,-2],[1.04,0]]);
    addRotate("body", [[0,0],[0.2,-2],[0.76,-2],[1.04,0]]);
    addRotate("core", [[0,0],[0.2,-3],[0.76,-3],[1.04,0]]);
    if (has("tail")) addRotate("tail", [[0,0],[0.52,8],[1.04,0]]);
    if (has("wing_l")) addRotate("wing_l", [[0,-4],[0.52,8],[1.04,-4]]);
  }));
  clips.push(clip("idle-comb", 1.18, () => {
    addRotate("upperarm_l", [[0,0],[0.24,-68],[0.88,-68],[1.18,0]]);
    addRotate("forearm_l", [[0,0],[0.24,84],[0.88,84],[1.18,0]]);
    addRotate("head", [[0,0],[0.24,12],[0.62,5],[0.92,12],[1.18,0]]);
    addRotate("torso", [[0,0],[0.24,3],[0.88,3],[1.18,0]]);
    addRotate("body", [[0,0],[0.24,3],[0.88,3],[1.18,0]]);
    addRotate("core", [[0,0],[0.24,4],[0.88,4],[1.18,0]]);
    if (has("wing_l")) addRotate("wing_l", [[0,-5],[0.59,12],[1.18,-5]]);
    if (has("tail")) addRotate("tail", [[0,-4],[0.59,6],[1.18,-4]]);
  }));
  clips.push(clip("idle-look-around", 1.36, () => {
    const lookBone = has("head") ? "head" : has("crown") ? "crown"
      : has("top") ? "top" : has("shell") ? "shell"
        : has("core") ? "core" : has("body") ? "body" : "root";
    addRotate(lookBone, [[0,0],[0.34,-13],[0.68,12],[1.02,-7],[1.36,0]]);
    addRotate("head", [[0,0],[0.34,-13],[0.68,12],[1.02,-7],[1.36,0]]);
    addRotate("crown", [[0,0],[0.34,-13],[0.68,12],[1.02,-7],[1.36,0]]);
    addRotate("top", [[0,0],[0.34,-11],[0.68,10],[1.02,-6],[1.36,0]]);
    addRotate("torso", [[0,0],[0.68,1.5],[1.36,0]]);
    addRotate("body", [[0,0],[0.68,1.5],[1.36,0]]);
    addRotate("shell", [[0,0],[0.68,2],[1.36,0]]);
    addRotate("core", [[0,0],[0.68,2],[1.36,0]]);
    if (has("tail")) addRotate("tail", [[0,-5],[0.68,5],[1.36,-5]]);
    if (has("wing_l")) addRotate("wing_l", [[0,-4],[0.68,4],[1.36,-4]]);
    if (has("wing_r")) addRotate("wing_r", [[0,4],[0.68,-4],[1.36,4]]);
  }));
  clips.push(clip("idle-groom", 1.24, () => {
    addRotate("head", [[0,0],[0.31,8],[0.62,-6],[0.93,8],[1.24,0]]);
    addRotate("crown", [[0,0],[0.31,8],[0.62,-6],[0.93,8],[1.24,0]]);
    addRotate("wing_l", [[0,-5],[0.31,-18],[0.62,-5],[0.93,-18],[1.24,-5]]);
    addRotate("wing_r", [[0,5],[0.31,18],[0.62,5],[0.93,18],[1.24,5]]);
    addRotate("tail", [[0,-7],[0.31,9],[0.62,-7],[0.93,9],[1.24,-7]]);
    addRotate("fin_top", [[0,-4],[0.62,7],[1.24,-4]]);
    addRotate("fin_bottom", [[0,4],[0.62,-7],[1.24,4]]);
    addRotate("claw_l", [[0,-4],[0.62,12],[1.24,-4]]);
    addRotate("claw_r", [[0,4],[0.62,-12],[1.24,4]]);
    addRotate("tentacle_1", [[0,-5],[0.62,8],[1.24,-5]]);
    addRotate("tentacle_2", [[0,5],[0.62,-8],[1.24,5]]);
    addRotate("tentacle_3", [[0,-4],[0.62,7],[1.24,-4]]);
    addRotate("tentacle_4", [[0,4],[0.62,-7],[1.24,4]]);
    addRotate("tentacle_5", [[0,-5],[0.62,8],[1.24,-5]]);
    addRotate("tentacle_6", [[0,5],[0.62,-8],[1.24,5]]);
    addRotate("shell", [[0,-2],[0.62,3],[1.24,-2]]);
    addRotate("top", [[0,-3],[0.62,4],[1.24,-3]]);
    addRotate("left", [[0,-4],[0.62,5],[1.24,-4]]);
    addRotate("right", [[0,4],[0.62,-5],[1.24,4]]);
    addRotate("base", [[0,0],[0.62,3],[1.24,0]]);
    addRotate("core", [[0,0],[0.62,2],[1.24,0]]);
    addRotate("root", [[0,0],[0.62,1.5],[1.24,0]]);
    addRotate("leg_1", [[0,-3],[0.62,5],[1.24,-3]]);
    addRotate("leg_4", [[0,3],[0.62,-5],[1.24,3]]);
    addRotate("front_leg_l", [[0,-3],[0.62,5],[1.24,-3]]);
    addRotate("back_leg_r", [[0,3],[0.62,-5],[1.24,3]]);
  }));
  clips.push(clip("locomotion", 0.56, () => {
    for (const [l,r] of limbPairs) pair(l,r, names.includes("wing_l") ? 18 : 24, 0.28);
    // Animate lower-arm and lower-leg joints independently from their parent limbs.
    for (const [l,r] of secondaryLimbPairs) pair(l,r, 13, 0.28);
    addTranslate(has("pelvis") ? "pelvis" : has("body") ? "body" : "core", [[0,0,0],[0.14,0,3],[0.28,0,0],[0.42,0,3],[0.56,0,0]]);
    if (has("head")) addRotate("head", [[0,-2],[0.28,2],[0.56,-2]]);
    if (has("tail")) addRotate("tail", [[0,-12],[0.28,12],[0.56,-12]]);
  }));
  clips.push(clip("jump", 0.42, () => {
    addTranslate(has("pelvis") ? "pelvis" : has("body") ? "body" : "core", [[0,0,0],[0.18,0,8],[0.42,0,5]]);
    for (const [l,r] of limbPairs) pair(l,r, 28, 0.21);
    for (const [l,r] of secondaryLimbPairs) pair(l,r, 24, 0.21);
    if (has("head")) addRotate("head", [[0,0],[0.2,-5],[0.42,0]]);
  }));
  clips.push(clip("fall", 0.42, () => {
    addRotate(has("torso") ? "torso" : has("body") ? "body" : "core", [[0,0],[0.42,-7]]);
    for (const [l,r] of limbPairs) pair(l,r, 16, 0.21);
    for (const [l,r] of secondaryLimbPairs) pair(l,r, 12, 0.21);
  }));
  clips.push(clip("land", 0.3, () => {
    addScale(has("pelvis") ? "pelvis" : has("body") ? "body" : "core", [[0,1,1],[0.1,1.12,0.82],[0.3,1,1]]);
    addTranslate(has("pelvis") ? "pelvis" : has("body") ? "body" : "core", [[0,0,0],[0.1,0,-5],[0.3,0,0]]);
  }));
  clips.push(clip("hit", 0.22, () => {
    addRotate(has("torso") ? "torso" : has("body") ? "body" : "core", [[0,0],[0.08,-12],[0.22,0]]);
    addScale(has("head") ? "head" : has("crown") ? "crown" : "core", [[0,1,1],[0.08,0.94,1.06],[0.22,1,1]]);
  }));
  clips.push(clip("defeat", 0.5, () => {
    addRotate(has("torso") ? "torso" : has("body") ? "body" : "core", [[0,0],[0.5,78]]);
    addScale(has("pelvis") ? "pelvis" : has("body") ? "body" : "core", [[0,1,1],[0.5,1.12,0.78]]);
  }));
  if (isBoss) {
    clips.push(clip("entrance", 0.8, () => {
      addTranslate("root", [[0,0,-characterHeight * 0.5],[0.8,0,0]]);
      addScale("aura", [[0,0.65,0.65],[0.4,1.15,1.15],[0.8,1,1]]);
    }));
    const signature = character.signatureMotion;
    clips.push(clip("signature", 0.84, () => {
      const body = has("torso") ? "torso" : has("body") ? "body" : "core";
      if (signature === "heavy-guard-pose") {
        addRotate(body, [[0,0],[0.28,-4],[0.56,4],[0.84,0]]);
        addScale("aura", [[0,1,1],[0.42,1.18,1.18],[0.84,1,1]]);
      } else if (signature === "weight-shift-and-flex") {
        addTranslate(body, [[0,0,0],[0.28,-4,0],[0.56,4,0],[0.84,0,0]]);
        addRotate("upperarm_l", [[0,0],[0.42,-12],[0.84,0]]);
        addRotate("upperarm_r", [[0,0],[0.42,12],[0.84,0]]);
      } else if (signature === "wing-spread-glide") {
        addRotate("wing_l", [[0,-8],[0.42,-28],[0.84,-8]]);
        addRotate("wing_r", [[0,8],[0.42,28],[0.84,8]]);
        addTranslate(body, [[0,0,0],[0.42,0,6],[0.84,0,0]]);
      } else if (signature === "solar-orbit-hover") {
        addRotate("top", [[0,0],[0.42,24],[0.84,0]]);
        addScale("aura", [[0,1,1],[0.42,1.3,1.3],[0.84,1,1]]);
      } else {
        addRotate(body, [[0,0],[0.42,18],[0.84,0]]);
        addRotate("head", [[0,0],[0.42,-8],[0.84,0]]);
        addScale("aura", [[0,1,1],[0.42,1.12,1.12],[0.84,1,1]]);
      }
    }));
    clips.push(clip("phase-change", 0.6, () => {
      addScale("aura", [[0,1,1],[0.3,1.5,1.5],[0.6,1,1]]);
      addRotate(has("head") ? "head" : "crown", [[0,0],[0.3,14],[0.6,0]]);
    }));
  }
  return clips;
}


function buildMesh(width, height, bones) {
  const uv = [], triangles = [], vertices = [];
  const pivots = bones.map((b, index) => ({ ...b, index }));
  const boundary = [];
  const vertexIndex = (x,y) => y * GRID + x;
  for (let y=0; y<GRID; y++) {
    for (let x=0; x<GRID; x++) {
      const u=x/(GRID-1), v=y/(GRID-1);
      const px=(u-0.5)*width, py=(0.5-v)*height;
      uv.push(u,v);
      if (y===0 || x===GRID-1 || y===GRID-1 || x===0) boundary.push(vertexIndex(x,y));
      const nearest = pivots.map(p => ({p,d:Math.hypot(px-p.x,py-p.y)}))
        .sort((a,b)=>a.d-b.d).slice(0,2);
      const total = 1 / Math.max(1e-6,nearest[0].d) + 1 / Math.max(1e-6,nearest[1].d);
      const weights = nearest.map(n => (1 / Math.max(1e-6,n.d)) / total);
      vertices.push(2,
        nearest[0].p.index, px-nearest[0].p.x, py-nearest[0].p.y, weights[0],
        nearest[1].p.index, px-nearest[1].p.x, py-nearest[1].p.y, weights[1]);
    }
  }
  for(let y=0;y<GRID-1;y++){
    for(let x=0;x<GRID-1;x++){
      const a=vertexIndex(x,y), b=vertexIndex(x+1,y), c=vertexIndex(x,y+1), d=vertexIndex(x+1,y+1);
      triangles.push(a,b,d,a,d,c);
    }
  }
  return { type:"mesh", uvs:uv, triangles, vertices, hull:boundary.length, width, height };
}

function createSkeleton(character, width, height, isBoss) {
  const bones = makeRigBones(character,width,height,isBoss);
  const mesh = buildMesh(width,height,bones);
  const skeletonBones = bones.map((b,i)=>({
    name:b.name,
    ...(i ? { parent:"root" } : {}),
    ...(b.length ? { length:b.length } : {}),
    ...(b.x ? { x:b.x } : {}),
    ...(b.y ? { y:b.y } : {}),
  }));
  const animations = {};
  for(const animation of chooseAnimation(character,bones,height,isBoss)){
    const {name,...definition}=animation;
    animations[name]=definition;
  }
  return {
    skeleton:{hash:"",fps:60,spine:"4.2.0",x:-width/2,y:-height/2,width,height},
    bones:skeletonBones,
    slots:[{name:"body",bone:"root",attachment:"art"}],
    skins:[{name:"default",attachments:{body:{art:mesh}}}],
    animations
  };
}

function writeCharacter(character,isBoss) {
  const dimensions = isBoss ? 160 : 128;
  const source = path.join(root,character.source);
  if(!fs.existsSync(source)) throw new Error(`Missing original art for ${character.id}: ${character.source}`);
  const outDir = path.join(root,"public/rigs",isBoss?"bosses":"enemies",character.id);
  fs.mkdirSync(outDir,{recursive:true});
  fs.copyFileSync(source,path.join(outDir,"art.png"));
  const skeleton = createSkeleton(character,dimensions,dimensions,isBoss);
  fs.writeFileSync(path.join(outDir,"skeleton.json"),JSON.stringify(skeleton,null,2)+"\n");
  fs.writeFileSync(path.join(outDir,"skeleton.atlas"),[
    "art.png",
    `size: ${dimensions}, ${dimensions}`,
    "filter: Linear, Linear",
    "art",
    `bounds: 0, 0, ${dimensions}, ${dimensions}`,
    ""
  ].join("\n"));
  character.rigFile=`public/rigs/${isBoss?"bosses":"enemies"}/${character.id}/skeleton.json`;
  character.atlas=`public/rigs/${isBoss?"bosses":"enemies"}/${character.id}/skeleton.atlas`;
  character.rigType="weighted-mesh-skeleton";
  character.meshVertexCount=GRID*GRID;
  character.animationClips=Object.keys(skeleton.animations);
  character.status="generated-weighted-mesh";
}

for(const enemy of roster.enemies) writeCharacter(enemy,false);
for(const boss of roster.bosses) writeCharacter(boss,true);
roster.status="rig-assets-generated-pending-visual-gameplay-verification";
roster.generatedAt=new Date().toISOString();
roster.generationMethod="Rigby2D 4.2 weighted mesh, generated from original approved transparent PNG artwork; bone-weighted deformation, not separated hand-drawn limb layers.";
fs.writeFileSync(rosterPath,JSON.stringify(roster,null,2)+"\n");
console.log(`Generated ${roster.enemies.length} enemy and ${roster.bosses.length} boss Rigby2D mesh rigs.`);
