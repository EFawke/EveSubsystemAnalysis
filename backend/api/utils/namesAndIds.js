const namesAndIds = [
    { name: "Legion Core - Dissolution Sequencer", id: 45622 },
    { name: "Legion Core - Augmented Antimatter Reactor", id: 45623 },
    { name: "Legion Core - Energy Parasitic Complex", id: 45624 },
    { name: "Tengu Core - Electronic Efficiency Gate", id: 45625 },
    { name: "Tengu Core - Augmented Graviton Reactor", id: 45626 },
    { name: "Tengu Core - Obfuscation Manifold", id: 45627 },
    { name: "Proteus Core - Electronic Efficiency Gate", id: 45628 },
    { name: "Proteus Core - Augmented Fusion Reactor", id: 45629 },
    { name: "Proteus Core - Friction Extension Processor", id: 45630 },
    { name: "Loki Core - Dissolution Sequencer", id: 45631 },
    { name: "Loki Core - Augmented Nuclear Reactor", id: 45632 },
    { name: "Loki Core - Immobility Drivers", id: 45633 },
    { name: "Legion Defensive - Covert Reconfiguration", id: 45586 },
    { name: "Legion Defensive - Augmented Plating", id: 45587 },
    { name: "Legion Defensive - Nanobot Injector", id: 45588 },
    { name: "Tengu Defensive - Covert Reconfiguration", id: 45589 },
    { name: "Tengu Defensive - Supplemental Screening", id: 45590 },
    { name: "Tengu Defensive - Amplification Node", id: 45591 },
    { name: "Proteus Defensive - Covert Reconfiguration", id: 45592 },
    { name: "Proteus Defensive - Augmented Plating", id: 45593 },
    { name: "Proteus Defensive - Nanobot Injector", id: 45594 },
    { name: "Loki Defensive - Covert Reconfiguration", id: 45595 },
    { name: "Loki Defensive - Augmented Durability", id: 45596 },
    { name: "Loki Defensive - Adaptive Defense Node", id: 45597 },
    { name: "Legion Propulsion - Interdiction Nullifier", id: 45610 },
    { name: "Legion Propulsion - Intercalated Nanofibers", id: 45611 },
    { name: "Legion Propulsion - Wake Limiter", id: 45612 },
    { name: "Tengu Propulsion - Interdiction Nullifier", id: 45613 },
    { name: "Tengu Propulsion - Chassis Optimization", id: 45614 },
    { name: "Tengu Propulsion - Fuel Catalyst", id: 45615 },
    { name: "Proteus Propulsion - Interdiction Nullifier", id: 45616 },
    { name: "Proteus Propulsion - Hyperspatial Optimization", id: 45617 },
    { name: "Proteus Propulsion - Localized Injectors", id: 45618 },
    { name: "Loki Propulsion - Interdiction Nullifier", id: 45619 },
    { name: "Loki Propulsion - Intercalated Nanofibers", id: 45620 },
    { name: "Loki Propulsion - Wake Limiter", id: 45621 },
    { name: "Legion Offensive - Liquid Crystal Magnifiers", id: 45598 },
    { name: "Legion Offensive - Assault Optimization", id: 45599 },
    { name: "Legion Offensive - Support Processor", id: 45600 },
    { name: "Tengu Offensive - Accelerated Ejection Bay", id: 45601 },
    { name: "Tengu Offensive - Magnetic Infusion Basin", id: 45602 },
    { name: "Tengu Offensive - Support Processor", id: 45603 },
    { name: "Proteus Offensive - Hybrid Encoding Platform", id: 45604 },
    { name: "Proteus Offensive - Drone Synthesis Projector", id: 45605 },
    { name: "Proteus Offensive - Support Processor", id: 45606 },
    { name: "Loki Offensive - Projectile Scoping Array", id: 45607 },
    { name: "Loki Offensive - Launcher Efficiency Configuration", id: 45608 },
    { name: "Loki Offensive - Support Processor", id: 45609 }
]

const materialsNamesAndIds = [
    { name: "Tritanium", id: 34 },
    {
        name: "Isogen",
        id: 37
    },
    {
        name: "Mexallon",
        id: 36
    },
    {
        name: "Nocxium",
        id: 38
    },
    {
        name: "Pyerite",
        id: 35
    },
    {
        name: "Zydrine",
        id: 39
    },
    {
        name: "Electromechanical Hull Sheeting",
        id: 30254
    },
    {
        name: "Emergent Combat Analyzer",
        id: 30248
    },
    {
        name: "Fused Nanomechanical Engines",
        id: 30018
    },
    {
        name: "Heuristic Selfassemblers",
        id: 30022
    },
    {
        name: "Melted Nanoribbons",
        id: 30259
    },
    {
        name: "Modified Fluid Router",
        id: 30021
    },
    {
        name: "Neurovisual Input Matrix",
        id: 30251
    },
    {
        name: "Powdered C-540 Graphite",
        id: 30019
    },
    {
        name: "Resonance Calibration Matrix",
        id: 30258
    },
    {
        name: "Carbon-86 Epoxy Resin",
        id: 30310
    },
    {
        name: "Fullerene Intercalated Graphite",
        id: 30305
    },
    {
        name: "Fulleroferrocene",
        id: 30303
    },
    {
        name: "Graphene Nanoribbons",
        id: 30309
    },
    {
        name: "Lanthanum Metallofullerene",
        id: 30307
    },
    {
        name: "Methanofullerene",
        id: 30306
    },
    {
        name: "PPD Fullerene Fibers",
        id: 30304
    },
    {
        name: "Scandium Metallofullerene",
        id: 30308
    },
    {
        name: "Fullerite-C28",
        id: 30375
    },
    {
        name: "Fullerite-C32",
        id: 30376
    },
    {
        name: "Fullerite-C320",
        id: 30377
    },
    {
        name: "Fullerite-C50",
        id: 30370
    },
    {
        name: "Fullerite-C60",
        id: 30371
    },
    {
        name: "Fullerite-C70",
        id: 30372
    },
    {
        name: "Fullerite-C72",
        id: 30373
    },
    {
        name: "Fullerite-C84",
        id: 30374
    },
    {
        name: "Helium Fuel Block",
        id: 4247
    },
    {
        name: "Hydrogen Fuel Block",
        id: 4246
    },
    {
        name: "Nitrogen Fuel Block",
        id: 4051
    },
    {
        name: "Oxygen Fuel Block",
        id: 4312
    },
    {
        name: "Intact Armor Nanobot",
        id: 30614
    },
    {
        name: "Intact Power Cores",
        id: 30582
    },
    {
        name: "Intact Thruster Sections",
        id: 30187
    },
    {
        name: "Intact Weapon Subroutines",
        id: 30628
    },
    {
        name: "Wrecked Armor Nanobot",
        id: 30618
    },
    {
        name: "Wrecked Power Cores",
        id: 30588
    },
    {
        name: "Wrecked Thruster Sections",
        id: 30562
    },
    {
        name: "Wrecked Weapon Subroutines",
        id: 30633
    },
    {
        name: "Malfunctioning Armor Nanobot",
        id: 30615
    },
    {
        name: "Malfunctioning Power Cores",
        id: 30586
    },
    {
        name: "Malfunctioning Thruster Sections",
        id: 30558
    },
    {
        name: "Malfunctioning Weapon Subroutines",
        id: 30632
    },
    {
        name: "Optimized Attainment Decryptor",
        id: 34207
    },
    {
        name: "Accelerant Decryptor",
        id: 34201
    },
    {
        name: "Attainment Decryptor",
        id: 34202
    },    
    {
        name: "Augmentation Decryptor",
        id: 34203
    },    
    {
        name: "Optimized Augmentation Decryptor",
        id: 34208
    },    
    {
        name: "Parity Decryptor",
        id: 34204
    },    
    {
        name: "Process Decryptor",
        id: 34205
    },    
    {
        name: "Symmetry Decryptor",
        id: 34206
    },
    {
        name: "Datacore - Defensive Subsystems Engineering",
        id: 11496
    },
    {
        name: "Datacore - Hydromagnetic Physics",
        id: 20171
    },
    {
        name: "Datacore - Rocket Science",
        id: 20420
    },
    {
        name: "Datacore - Propulsion Subsystems Engineering",
        id: 20114
    },
    {
        name: "Datacore - Offensive Subsystems Engineering",
        id: 20425
    },
    {
        name: "Datacore - Plasma Physics",
        id: 20412
    },
    {
        name: "Datacore - Quantum Physics",
        id: 20414
    },
    {
        name: "Datacore - Core Subsystems Engineering",
        id: 20115
    }
];

const subsystemIDArr = ["45622", "45623", "45624", "45625", "45626", "45627", "45628", "45629", "45630", "45631", "45632", "45633", "45586", "45587", "45588", "45589", "45590", "45591", "45592", "45593", "45594", "45595", "45596", "45597", "45610", "45611", "45612", "45613", "45614", "45615", "45616", "45617", "45618", "45619", "45620", "45621", "45598", "45599", "45600", "45601", "45602", "45603", "45604", "45605", "45606", "45607", "45608", "45609"]

module.exports = { subsystemIDArr, namesAndIds, materialsNamesAndIds };