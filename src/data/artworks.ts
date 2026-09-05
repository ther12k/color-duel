import { Artwork } from '../types/game';

export const ARTWORKS: Artwork[] = [
  // 1. BUTTERFLIES & LILAC BLOOM (Signature Happy Color artwork matching uploaded screenshots!)
  {
    id: 'lilac-butterflies',
    title: 'Butterflies & Lilac Bloom',
    subtitle: 'Delicate swallowtail wings resting on fragrant lilac petals',
    category: 'Nature',
    likes: '24.8K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Medium',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 120,
    isDaily: true,
    palette: [
      { number: 1, hex: '#FCE7F3', name: 'Pale Blossom' },
      { number: 2, hex: '#FB7185', name: 'Coral Rose' },
      { number: 3, hex: '#EC4899', name: 'Electric Magenta' },
      { number: 4, hex: '#831843', name: 'Deep Wine Plum' },
      { number: 5, hex: '#F8FAFC', name: 'Lilac White' },
      { number: 6, hex: '#4ADE80', name: 'Spring Leaf' },
      { number: 7, hex: '#15803D', name: 'Forest Foliage' },
      { number: 8, hex: '#C084FC', name: 'Soft Lavender' },
    ],
    objectives: [
      {
        id: 'obj-magenta-flower',
        title: 'Color Magenta Center',
        objectId: 'center-flower',
        deadlineSeconds: 35,
        bonusPoints: 30,
        iconType: 'flower',
        totalRegions: 4,
      },
      {
        id: 'obj-butterfly-wings',
        title: 'Color Butterfly Wings',
        objectId: 'butterfly',
        deadlineSeconds: 70,
        bonusPoints: 30,
        iconType: 'star',
        totalRegions: 6,
      },
      {
        id: 'obj-lilac-foliage',
        title: 'Color Lilac Foliage',
        objectId: 'foliage',
        deadlineSeconds: 100,
        bonusPoints: 30,
        iconType: 'gem',
        totalRegions: 4,
      },
    ],
    regions: [
      // Central 4 Petals of Color #3 (Exactly matching Screenshot 22-43-54 and 22-44-02!)
      {
        id: 'lb-petal-top',
        objectId: 'center-flower',
        path: 'M 225 180 C 220 145 270 145 265 180 C 255 205 235 205 225 180 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 245, y: 172 },
        name: 'Center Flower Top Petal',
      },
      {
        id: 'lb-petal-bottom',
        objectId: 'center-flower',
        path: 'M 220 220 C 215 255 265 255 260 220 C 250 205 230 205 220 220 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 240, y: 232 },
        name: 'Center Flower Bottom Petal',
      },
      {
        id: 'lb-petal-left',
        objectId: 'center-flower',
        path: 'M 220 185 C 180 180 180 230 220 225 C 235 215 235 195 220 185 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 200, y: 205 },
        name: 'Center Flower Left Petal',
      },
      {
        id: 'lb-petal-right',
        objectId: 'center-flower',
        path: 'M 265 185 C 305 180 305 230 265 225 C 250 215 250 195 265 185 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 285, y: 205 },
        name: 'Center Flower Right Petal',
      },
      // Florets Around Center (Numbers 5, 8, 2, 4 from Screenshot 22-43-54!)
      {
        id: 'lb-floret-topleft-1',
        objectId: 'florets',
        path: 'M 140 160 C 135 120 195 120 190 160 C 180 180 150 180 140 160 Z',
        colorIndex: 5, // White Lilac
        labelPos: { x: 165, y: 152 },
        name: 'Lilac Floret 5 Top',
      },
      {
        id: 'lb-floret-topleft-2',
        objectId: 'florets',
        path: 'M 100 190 C 80 155 140 140 150 180 C 145 205 115 210 100 190 Z',
        colorIndex: 5, // White Lilac
        labelPos: { x: 120, y: 180 },
        name: 'Lilac Floret 5 Outer',
      },
      {
        id: 'lb-floret-midleft-1',
        objectId: 'florets',
        path: 'M 110 230 C 85 240 105 295 145 285 C 160 265 145 235 110 230 Z',
        colorIndex: 8, // Lavender
        labelPos: { x: 125, y: 260 },
        name: 'Lavender Floret 8',
      },
      {
        id: 'lb-floret-center-left',
        objectId: 'florets',
        path: 'M 150 250 C 150 215 205 220 200 255 C 190 280 160 275 150 250 Z',
        colorIndex: 2, // Coral Rose
        labelPos: { x: 175, y: 250 },
        name: 'Coral Floret 2',
      },
      {
        id: 'lb-floret-bottom-5',
        objectId: 'florets',
        path: 'M 195 280 C 195 250 260 250 260 280 C 255 310 200 310 195 280 Z',
        colorIndex: 5, // Lilac White
        labelPos: { x: 228, y: 285 },
        name: 'Lilac Floret 5 Lower',
      },
      {
        id: 'lb-floret-bottom-8',
        objectId: 'florets',
        path: 'M 175 320 C 155 310 170 370 215 365 C 230 340 210 315 175 320 Z',
        colorIndex: 8, // Lavender
        labelPos: { x: 195, y: 345 },
        name: 'Lavender Floret 8 Bottom',
      },
      {
        id: 'lb-floret-bottom-4',
        objectId: 'florets',
        path: 'M 245 320 C 240 290 305 295 300 330 C 290 355 255 350 245 320 Z',
        colorIndex: 4, // Deep Plum
        labelPos: { x: 272, y: 325 },
        name: 'Plum Floret 4 Lower',
      },
      // Top Butterfly Wings & Details (Screenshots 22-43-50 & 22-43-54)
      {
        id: 'lb-butterfly-topwing-outer',
        objectId: 'butterfly',
        path: 'M 220 110 C 190 60 270 30 330 40 C 310 70 280 110 220 110 Z',
        colorIndex: 2, // Coral
        labelPos: { x: 265, y: 70 },
        name: 'Swallowtail Forewing Rim',
      },
      {
        id: 'lb-butterfly-topwing-cell1',
        objectId: 'butterfly',
        path: 'M 230 110 C 260 80 300 70 310 90 C 290 120 250 125 230 110 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 270, y: 95 },
        name: 'Swallowtail Forewing Cell',
      },
      {
        id: 'lb-butterfly-topwing-cell2',
        objectId: 'butterfly',
        path: 'M 220 125 C 250 120 290 120 285 140 C 260 155 230 145 220 125 Z',
        colorIndex: 4, // Plum
        labelPos: { x: 255, y: 135 },
        name: 'Swallowtail Wing Accent',
      },
      {
        id: 'lb-butterfly-topwing-veins',
        objectId: 'butterfly',
        path: 'M 200 135 C 195 110 220 105 225 125 C 220 145 205 145 200 135 Z',
        colorIndex: 8, // Lavender
        labelPos: { x: 210, y: 128 },
        name: 'Swallowtail Inner Basal',
      },
      {
        id: 'lb-butterfly-topwing-tail',
        objectId: 'butterfly',
        path: 'M 245 150 C 265 145 280 160 270 175 C 255 180 245 165 245 150 Z',
        colorIndex: 1, // Pale Blossom
        labelPos: { x: 260, y: 162 },
        name: 'Swallowtail Wing Notch',
      },
      // Lower Butterfly Wings (Screenshots 22-43-50 & 22-43-54)
      {
        id: 'lb-lowerwing-outer',
        objectId: 'butterfly',
        path: 'M 320 230 C 370 200 440 215 450 250 C 430 285 370 290 320 230 Z',
        colorIndex: 4, // Plum
        labelPos: { x: 385, y: 245 },
        name: 'Right Butterfly Wing Outer',
      },
      {
        id: 'lb-lowerwing-cell-top',
        objectId: 'butterfly',
        path: 'M 330 255 C 360 245 420 255 410 280 C 380 295 345 285 330 255 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 370, y: 270 },
        name: 'Right Butterfly Wing Heart',
      },
      {
        id: 'lb-lowerwing-cell-mid',
        objectId: 'butterfly',
        path: 'M 335 290 C 365 285 415 295 400 320 C 370 330 345 315 335 290 Z',
        colorIndex: 2, // Coral
        labelPos: { x: 368, y: 308 },
        name: 'Right Butterfly Lower Cell',
      },
      {
        id: 'lb-lowerwing-cell-bottom',
        objectId: 'butterfly',
        path: 'M 345 325 C 375 320 405 335 390 360 C 360 365 345 345 345 325 Z',
        colorIndex: 1, // Pale Blossom
        labelPos: { x: 368, y: 342 },
        name: 'Right Butterfly Wing Margin',
      },
      // Foliage & Lilac Leaves (Screenshot 22-44-06)
      {
        id: 'lb-leaf-large-top',
        objectId: 'foliage',
        path: 'M 60 270 C 40 220 110 210 130 250 C 140 290 80 300 60 270 Z',
        colorIndex: 6, // Bright Green
        labelPos: { x: 90, y: 255 },
        name: 'Broad Lilac Leaf Top',
      },
      {
        id: 'lb-leaf-large-bottom',
        objectId: 'foliage',
        path: 'M 70 300 C 50 340 120 370 145 330 C 150 295 90 280 70 300 Z',
        colorIndex: 7, // Forest Green
        labelPos: { x: 105, y: 330 },
        name: 'Broad Lilac Leaf Bottom',
      },
      {
        id: 'lb-leaf-cluster-left',
        objectId: 'foliage',
        path: 'M 30 350 C 15 320 65 310 80 340 C 90 370 45 375 30 350 Z',
        colorIndex: 6, // Bright Green
        labelPos: { x: 55, y: 345 },
        name: 'Lilac Tender Foliage',
      },
      {
        id: 'lb-stem-bud-cluster',
        objectId: 'foliage',
        path: 'M 50 170 C 40 120 90 100 105 140 C 110 170 65 190 50 170 Z',
        colorIndex: 7, // Forest Green
        labelPos: { x: 80, y: 145 },
        name: 'Lilac Sprout Stem',
      },
      // Upper Blossom Sprigs & Canopy
      {
        id: 'lb-upper-floret-1',
        objectId: 'florets',
        path: 'M 170 60 C 150 30 210 20 220 55 C 215 80 180 80 170 60 Z',
        colorIndex: 1, // Pale Blossom
        labelPos: { x: 195, y: 52 },
        name: 'Canopy Blossom 1',
      },
      {
        id: 'lb-upper-floret-2',
        objectId: 'florets',
        path: 'M 230 45 C 230 15 285 20 280 50 C 270 70 240 65 230 45 Z',
        colorIndex: 8, // Lavender
        labelPos: { x: 255, y: 45 },
        name: 'Canopy Blossom 2',
      },
      {
        id: 'lb-upper-floret-3',
        objectId: 'florets',
        path: 'M 290 60 C 285 30 340 30 340 60 C 330 85 295 80 290 60 Z',
        colorIndex: 5, // White Lilac
        labelPos: { x: 315, y: 58 },
        name: 'Canopy Blossom 3',
      },
      // Lower Floral Background Base
      {
        id: 'lb-bottom-bouquet-left',
        objectId: 'florets',
        path: 'M 130 380 C 100 410 160 460 190 430 C 210 400 160 370 130 380 Z',
        colorIndex: 2, // Coral Rose
        labelPos: { x: 160, y: 415 },
        name: 'Lower Bouquet Bloom Left',
      },
      {
        id: 'lb-bottom-bouquet-center',
        objectId: 'florets',
        path: 'M 200 410 C 180 440 245 480 270 440 C 280 410 225 390 200 410 Z',
        colorIndex: 3, // Magenta
        labelPos: { x: 235, y: 435 },
        name: 'Lower Bouquet Center Rose',
      },
      {
        id: 'lb-bottom-bouquet-right',
        objectId: 'florets',
        path: 'M 280 400 C 265 435 330 470 350 430 C 360 400 305 385 280 400 Z',
        colorIndex: 5, // Lilac White
        labelPos: { x: 315, y: 425 },
        name: 'Lower Bouquet Bloom Right',
      },
    ],
  },

  // 2. COZY KITCHEN RETREAT (Matching Screenshot 22-43-50 top-left)
  {
    id: 'cozy-kitchen',
    title: 'Cozy Kitchen Retreat',
    subtitle: 'Warm prep island with crimson barstools and herb planters',
    category: 'Cozy',
    likes: '19.4K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Easy',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 120,
    palette: [
      { number: 1, hex: '#FDE047', name: 'Pendant Glow' },
      { number: 2, hex: '#EF4444', name: 'Crimson Stools' },
      { number: 3, hex: '#FDBA74', name: 'Warm Island Peach' },
      { number: 4, hex: '#FCA5A5', name: 'Tile Backsplash' },
      { number: 5, hex: '#22C55E', name: 'Herb Planter' },
      { number: 6, hex: '#B45309', name: 'Rustic Wood' },
      { number: 7, hex: '#64748B', name: 'Fixture Steel' },
      { number: 8, hex: '#78350F', name: 'Dark Wood Accents' },
    ],
    objectives: [
      {
        id: 'obj-kitchen-stools',
        title: 'Color Red Barstools',
        objectId: 'stools',
        deadlineSeconds: 35,
        bonusPoints: 30,
        iconType: 'window',
        totalRegions: 3,
      },
      {
        id: 'obj-kitchen-island',
        title: 'Color Prep Island Bar',
        objectId: 'island',
        deadlineSeconds: 65,
        bonusPoints: 30,
        iconType: 'awning',
        totalRegions: 4,
      },
      {
        id: 'obj-kitchen-backsplash',
        title: 'Color Tile Backsplash',
        objectId: 'backsplash',
        deadlineSeconds: 95,
        bonusPoints: 30,
        iconType: 'lantern',
        totalRegions: 3,
      },
    ],
    regions: [
      // Hanging Pendant Lights
      {
        id: 'ck-pendant-left',
        objectId: 'pendant',
        path: 'M 100 50 C 90 90 160 90 150 50 Z',
        colorIndex: 1,
        labelPos: { x: 125, y: 70 },
        name: 'Left Pendant Lamp',
      },
      {
        id: 'ck-pendant-right',
        objectId: 'pendant',
        path: 'M 280 50 C 270 90 340 90 330 50 Z',
        colorIndex: 1,
        labelPos: { x: 305, y: 70 },
        name: 'Right Pendant Lamp',
      },
      // Range Hood & Upper Cabinets
      {
        id: 'ck-hood-canopy',
        objectId: 'cabinets',
        path: 'M 170 50 L 260 50 L 270 120 L 160 120 Z',
        colorIndex: 6,
        labelPos: { x: 215, y: 85 },
        name: 'Range Hood Canopy',
      },
      {
        id: 'ck-upper-cabinet-left',
        objectId: 'cabinets',
        path: 'M 20 50 L 90 50 L 90 150 L 20 150 Z',
        colorIndex: 8,
        labelPos: { x: 55, y: 100 },
        name: 'Upper Left Cupboard',
      },
      {
        id: 'ck-upper-cabinet-right',
        objectId: 'cabinets',
        path: 'M 350 50 L 480 50 L 480 150 L 350 150 Z',
        colorIndex: 8,
        labelPos: { x: 415, y: 100 },
        name: 'Upper Right Cupboard',
      },
      // Tile Backsplash (Pinkish subway tiles from screenshot)
      {
        id: 'ck-backsplash-left',
        objectId: 'backsplash',
        path: 'M 20 155 L 160 155 L 160 240 L 20 240 Z',
        colorIndex: 4,
        labelPos: { x: 90, y: 200 },
        name: 'Left Subway Tile Wall',
      },
      {
        id: 'ck-backsplash-center',
        objectId: 'backsplash',
        path: 'M 165 130 L 265 130 L 265 240 L 165 240 Z',
        colorIndex: 4,
        labelPos: { x: 215, y: 185 },
        name: 'Center Stove Tile Wall',
      },
      {
        id: 'ck-backsplash-right',
        objectId: 'backsplash',
        path: 'M 270 155 L 480 155 L 480 240 L 270 240 Z',
        colorIndex: 4,
        labelPos: { x: 375, y: 200 },
        name: 'Right Subway Tile Wall',
      },
      // Countertop Sink & Herb Planters
      {
        id: 'ck-herb-plant-pot',
        objectId: 'herbs',
        path: 'M 90 190 L 120 190 L 115 230 L 95 230 Z',
        colorIndex: 2,
        labelPos: { x: 107, y: 210 },
        name: 'Ceramic Herb Pot',
      },
      {
        id: 'ck-herb-leaves',
        objectId: 'herbs',
        path: 'M 85 150 C 70 130 140 130 125 150 C 135 180 80 180 85 150 Z',
        colorIndex: 5,
        labelPos: { x: 105, y: 155 },
        name: 'Fresh Basil Foliage',
      },
      {
        id: 'ck-sink-faucet',
        objectId: 'faucet',
        path: 'M 230 190 L 250 190 L 250 230 L 230 230 Z',
        colorIndex: 7,
        labelPos: { x: 240, y: 210 },
        name: 'Gooseneck Chrome Faucet',
      },
      // Kitchen Island (Peach body with wood counter slab)
      {
        id: 'ck-island-slab',
        objectId: 'island',
        path: 'M 30 240 L 460 240 L 440 270 L 10 270 Z',
        colorIndex: 6,
        labelPos: { x: 235, y: 255 },
        name: 'Butcher Block Island Slab',
      },
      {
        id: 'ck-island-panel-left',
        objectId: 'island',
        path: 'M 15 270 L 150 270 L 150 430 L 25 430 Z',
        colorIndex: 3,
        labelPos: { x: 80, y: 350 },
        name: 'Island Left Panel',
      },
      {
        id: 'ck-island-panel-center',
        objectId: 'island',
        path: 'M 155 270 L 310 270 L 310 430 L 155 430 Z',
        colorIndex: 3,
        labelPos: { x: 230, y: 350 },
        name: 'Island Center Drawer Panel',
      },
      {
        id: 'ck-island-panel-right',
        objectId: 'island',
        path: 'M 315 270 L 435 270 L 415 430 L 315 430 Z',
        colorIndex: 3,
        labelPos: { x: 375, y: 350 },
        name: 'Island Right Panel',
      },
      // Red Barstools (Screenshot 22-43-50 top-left)
      {
        id: 'ck-stool-cushion-1',
        objectId: 'stools',
        path: 'M 50 310 C 40 290 100 290 90 310 C 95 330 45 330 50 310 Z',
        colorIndex: 2,
        labelPos: { x: 70, y: 310 },
        name: 'Left Barstool Cushion',
      },
      {
        id: 'ck-stool-cushion-2',
        objectId: 'stools',
        path: 'M 115 310 C 105 290 165 290 155 310 C 160 330 110 330 115 310 Z',
        colorIndex: 2,
        labelPos: { x: 135, y: 310 },
        name: 'Center Barstool Cushion',
      },
      {
        id: 'ck-stool-cushion-3',
        objectId: 'stools',
        path: 'M 180 310 C 170 290 230 290 220 310 C 225 330 175 330 180 310 Z',
        colorIndex: 2,
        labelPos: { x: 200, y: 310 },
        name: 'Right Barstool Cushion',
      },
      {
        id: 'ck-stool-legs-base',
        objectId: 'stools',
        path: 'M 55 330 L 85 330 L 95 470 L 45 470 Z',
        colorIndex: 8,
        labelPos: { x: 70, y: 400 },
        name: 'Stool Iron Leg Frame',
      },
      // Floor Base
      {
        id: 'ck-hardwood-floor',
        objectId: 'floor',
        path: 'M 0 450 L 500 450 L 500 500 L 0 500 Z',
        colorIndex: 6,
        labelPos: { x: 250, y: 475 },
        name: 'Herringbone Hardwood Floor',
      },
    ],
  },

  // 3. SUNLIT PLAZA FOUNTAIN (Matching Screenshot 22-43-50 mid-left)
  {
    id: 'plaza-fountain',
    title: 'Sunlit Plaza Fountain',
    subtitle: 'Classic European stone fountain and sunny pastel villas',
    category: 'Masterpiece',
    likes: '16.8K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Hard',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 150,
    palette: [
      { number: 1, hex: '#06B6D4', name: 'Turquoise Water' },
      { number: 2, hex: '#F59E0B', name: 'Sunny Villa' },
      { number: 3, hex: '#E11D48', name: 'Terracotta Roof' },
      { number: 4, hex: '#94A3B8', name: 'Carved Stone' },
      { number: 5, hex: '#10B981', name: 'Balcony Flowers' },
      { number: 6, hex: '#38BDF8', name: 'Summer Sky' },
      { number: 7, hex: '#64748B', name: 'Piazza Cobblestone' },
      { number: 8, hex: '#6366F1', name: 'Distant Vista' },
    ],
    objectives: [
      {
        id: 'obj-fountain-basin',
        title: 'Color Stone Fountain',
        objectId: 'fountain',
        deadlineSeconds: 40,
        bonusPoints: 30,
        iconType: 'star',
        totalRegions: 4,
      },
      {
        id: 'obj-water-cascade',
        title: 'Color Turquoise Water',
        objectId: 'water',
        deadlineSeconds: 75,
        bonusPoints: 30,
        iconType: 'bowl',
        totalRegions: 3,
      },
      {
        id: 'obj-townhouses',
        title: 'Color Mediterranean Facades',
        objectId: 'facades',
        deadlineSeconds: 110,
        bonusPoints: 30,
        iconType: 'awning',
        totalRegions: 4,
      },
    ],
    regions: [
      // Sky & Distant Mountain
      {
        id: 'pf-sky-top',
        objectId: 'sky',
        path: 'M 0 0 L 500 0 L 500 130 L 0 130 Z',
        colorIndex: 6,
        labelPos: { x: 250, y: 40 },
        name: 'Azure Mediterranean Sky',
      },
      {
        id: 'pf-distant-mountain',
        objectId: 'sky',
        path: 'M 180 130 L 250 80 L 320 130 Z',
        colorIndex: 8,
        labelPos: { x: 250, y: 110 },
        name: 'Sunlit Mountain Ridge',
      },
      // Townhouses Left (Peach facade, terracotta roof)
      {
        id: 'pf-roof-left',
        objectId: 'roofs',
        path: 'M 20 80 L 140 40 L 160 120 L 20 120 Z',
        colorIndex: 3,
        labelPos: { x: 90, y: 80 },
        name: 'Left Villa Clay Tile Roof',
      },
      {
        id: 'pf-facade-left',
        objectId: 'facades',
        path: 'M 30 120 L 170 120 L 170 280 L 30 280 Z',
        colorIndex: 2,
        labelPos: { x: 100, y: 200 },
        name: 'Ochre Villa Facade',
      },
      {
        id: 'pf-balcony-flora-left',
        objectId: 'flora',
        path: 'M 40 200 C 30 180 120 180 110 200 C 120 220 30 220 40 200 Z',
        colorIndex: 5,
        labelPos: { x: 75, y: 200 },
        name: 'Balcony Geraniums',
      },
      // Townhouses Right (Rose facade, tall mansard roof)
      {
        id: 'pf-roof-right',
        objectId: 'roofs',
        path: 'M 330 60 L 440 20 L 480 110 L 330 110 Z',
        colorIndex: 3,
        labelPos: { x: 410, y: 70 },
        name: 'Right Villa Gable Roof',
      },
      {
        id: 'pf-facade-right',
        objectId: 'facades',
        path: 'M 320 110 L 480 110 L 480 270 L 320 270 Z',
        colorIndex: 2,
        labelPos: { x: 400, y: 190 },
        name: 'Right Villa Stucco Facade',
      },
      {
        id: 'pf-window-shutters',
        objectId: 'facades',
        path: 'M 360 140 L 410 140 L 410 190 L 360 190 Z',
        colorIndex: 8,
        labelPos: { x: 385, y: 165 },
        name: 'Wood Louvered Shutters',
      },
      // Ornate Carved Center Stone Fountain (Screenshot 22-43-50 mid-left)
      {
        id: 'pf-fountain-spire',
        objectId: 'fountain',
        path: 'M 240 180 L 260 180 L 255 240 L 245 240 Z',
        colorIndex: 4,
        labelPos: { x: 250, y: 210 },
        name: 'Fountain Carved Spire',
      },
      {
        id: 'pf-fountain-tier1',
        objectId: 'fountain',
        path: 'M 215 240 C 200 230 300 230 285 240 C 275 260 225 260 215 240 Z',
        colorIndex: 4,
        labelPos: { x: 250, y: 245 },
        name: 'Upper Stone Shell Basin',
      },
      {
        id: 'pf-water-tier1',
        objectId: 'water',
        path: 'M 220 235 C 220 225 280 225 280 235 C 275 245 225 245 220 235 Z',
        colorIndex: 1,
        labelPos: { x: 250, y: 235 },
        name: 'Upper Turquoise Water Pool',
      },
      {
        id: 'pf-fountain-pedestal',
        objectId: 'fountain',
        path: 'M 235 260 L 265 260 L 270 320 L 230 320 Z',
        colorIndex: 4,
        labelPos: { x: 250, y: 290 },
        name: 'Central Fluted Column',
      },
      {
        id: 'pf-fountain-basin-rim',
        objectId: 'fountain',
        path: 'M 140 320 C 120 300 380 300 360 320 C 370 370 130 370 140 320 Z',
        colorIndex: 4,
        labelPos: { x: 250, y: 345 },
        name: 'Grand Piazza Basin Rim',
      },
      {
        id: 'pf-water-basin-pool',
        objectId: 'water',
        path: 'M 155 320 C 145 310 355 310 345 320 C 350 355 150 355 155 320 Z',
        colorIndex: 1,
        labelPos: { x: 250, y: 330 },
        name: 'Basin Turquoise Water',
      },
      // Cobblestone Piazza Ground
      {
        id: 'pf-cobblestone-left',
        objectId: 'cobblestone',
        path: 'M 10 320 L 140 340 L 130 480 L 10 480 Z',
        colorIndex: 7,
        labelPos: { x: 70, y: 410 },
        name: 'Western Piazza Flagstones',
      },
      {
        id: 'pf-cobblestone-right',
        objectId: 'cobblestone',
        path: 'M 360 340 L 490 320 L 490 480 L 370 480 Z',
        colorIndex: 7,
        labelPos: { x: 430, y: 410 },
        name: 'Eastern Piazza Flagstones',
      },
      {
        id: 'pf-cobblestone-front',
        objectId: 'cobblestone',
        path: 'M 130 400 L 370 400 L 380 490 L 120 490 Z',
        colorIndex: 7,
        labelPos: { x: 250, y: 450 },
        name: 'Fountain Promenade Cobblestone',
      },
    ],
  },

  // 4. TROPICAL MACAW HAVEN (Matching Screenshot 22-43-50 mid-right)
  {
    id: 'tropical-macaw',
    title: 'Tropical Macaw Haven',
    subtitle: 'Vibrant scarlet macaw beside a sunny cottage window',
    category: 'Nature',
    likes: '18.2K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Medium',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 120,
    palette: [
      { number: 1, hex: '#EF4444', name: 'Scarlet Plumage' },
      { number: 2, hex: '#3B82F6', name: 'Cobalt Wingtips' },
      { number: 3, hex: '#FBBF24', name: 'Sunflower Gold' },
      { number: 4, hex: '#10B981', name: 'Tropical Monstera' },
      { number: 5, hex: '#FEF08A', name: 'Sunlit Curtains' },
      { number: 6, hex: '#A855F7', name: 'Room Lavender' },
      { number: 7, hex: '#64748B', name: 'Window Frame' },
      { number: 8, hex: '#B45309', name: 'Perch Wood' },
    ],
    objectives: [
      {
        id: 'obj-macaw-body',
        title: 'Color Scarlet Macaw',
        objectId: 'macaw',
        deadlineSeconds: 35,
        bonusPoints: 30,
        iconType: 'star',
        totalRegions: 4,
      },
      {
        id: 'obj-sunflower-vase',
        title: 'Color Sunflower Bouquet',
        objectId: 'sunflower',
        deadlineSeconds: 65,
        bonusPoints: 30,
        iconType: 'flower',
        totalRegions: 3,
      },
      {
        id: 'obj-monstera',
        title: 'Color Monstera Leaves',
        objectId: 'foliage',
        deadlineSeconds: 95,
        bonusPoints: 30,
        iconType: 'gem',
        totalRegions: 3,
      },
    ],
    regions: [
      // Sunny Window Background & Curtains
      {
        id: 'tm-window-glass',
        objectId: 'window',
        path: 'M 60 40 L 220 40 L 220 220 L 60 220 Z',
        colorIndex: 7,
        labelPos: { x: 140, y: 130 },
        name: 'Arch Window Glass',
      },
      {
        id: 'tm-curtain-left',
        objectId: 'window',
        path: 'M 40 30 C 60 90 20 180 50 240 L 20 240 Z',
        colorIndex: 5,
        labelPos: { x: 35, y: 135 },
        name: 'Sunlit Draped Curtain',
      },
      {
        id: 'tm-room-wall',
        objectId: 'wall',
        path: 'M 225 30 L 480 30 L 480 260 L 225 260 Z',
        colorIndex: 6,
        labelPos: { x: 350, y: 100 },
        name: 'Lavender Cozy Living Wall',
      },
      // Scarlet Macaw Parrot on Perch (Screenshot 22-43-50 mid-right)
      {
        id: 'tm-macaw-head',
        objectId: 'macaw',
        path: 'M 350 110 C 330 80 400 70 410 110 C 400 130 365 135 350 110 Z',
        colorIndex: 1, // Scarlet
        labelPos: { x: 380, y: 100 },
        name: 'Macaw Scarlet Crown',
      },
      {
        id: 'tm-macaw-beak',
        objectId: 'macaw',
        path: 'M 405 105 L 430 115 L 410 125 Z',
        colorIndex: 3, // Golden Beak
        labelPos: { x: 415, y: 115 },
        name: 'Carved Golden Beak',
      },
      {
        id: 'tm-macaw-chest',
        objectId: 'macaw',
        path: 'M 355 125 C 340 160 395 200 405 160 C 410 130 375 120 355 125 Z',
        colorIndex: 1, // Scarlet
        labelPos: { x: 380, y: 155 },
        name: 'Macaw Scarlet Breast',
      },
      {
        id: 'tm-macaw-wing-blue',
        objectId: 'macaw',
        path: 'M 360 165 C 330 220 380 270 400 240 C 415 190 390 170 360 165 Z',
        colorIndex: 2, // Cobalt
        labelPos: { x: 375, y: 215 },
        name: 'Macaw Cobalt Primary Wing',
      },
      {
        id: 'tm-macaw-tail-plumage',
        objectId: 'macaw',
        path: 'M 370 240 C 350 300 390 360 395 350 C 410 300 395 250 370 240 Z',
        colorIndex: 1, // Scarlet
        labelPos: { x: 385, y: 295 },
        name: 'Macaw Long Tail Feathers',
      },
      {
        id: 'tm-perch-stand',
        objectId: 'perch',
        path: 'M 330 250 L 440 250 L 435 270 L 335 270 Z',
        colorIndex: 8,
        labelPos: { x: 385, y: 260 },
        name: 'Oak Bird Perch Rod',
      },
      // Sunflowers in Ceramic Vase (Screenshot 22-43-50 mid-right)
      {
        id: 'tm-sunflower-center',
        objectId: 'sunflower',
        path: 'M 180 320 C 160 300 220 300 210 320 C 220 340 170 340 180 320 Z',
        colorIndex: 8, // Dark Brown
        labelPos: { x: 195, y: 320 },
        name: 'Sunflower Seed Heart',
      },
      {
        id: 'tm-sunflower-petals-ring',
        objectId: 'sunflower',
        path: 'M 150 310 C 130 260 250 255 240 310 C 255 370 135 370 150 310 Z',
        colorIndex: 3, // Golden Yellow
        labelPos: { x: 195, y: 285 },
        name: 'Sunflower Radiant Petals',
      },
      {
        id: 'tm-sunflower-vase-pot',
        objectId: 'sunflower',
        path: 'M 160 360 L 230 360 L 220 460 L 170 460 Z',
        colorIndex: 2, // Cobalt Glaze
        labelPos: { x: 195, y: 410 },
        name: 'Ceramic Cobalt Bouquet Vase',
      },
      // Monstera Foliage
      {
        id: 'tm-monstera-leaf-left',
        objectId: 'foliage',
        path: 'M 30 280 C 10 350 110 390 120 320 C 130 280 50 260 30 280 Z',
        colorIndex: 4,
        labelPos: { x: 70, y: 320 },
        name: 'Monstera Frond Left',
      },
      {
        id: 'tm-monstera-leaf-mid',
        objectId: 'foliage',
        path: 'M 80 370 C 60 450 160 460 150 400 C 160 360 100 350 80 370 Z',
        colorIndex: 4,
        labelPos: { x: 115, y: 410 },
        name: 'Monstera Frond Center',
      },
      {
        id: 'tm-table-surface',
        objectId: 'table',
        path: 'M 10 450 L 490 450 L 490 500 L 10 500 Z',
        colorIndex: 8,
        labelPos: { x: 250, y: 475 },
        name: 'Mahogany Sunroom Table',
      },
    ],
  },

  // 5. STORYBOOK DRAGON BAKER (Adorable Chibi Fantasy)
  {
    id: 'dragon-bakery',
    title: 'Storybook Dragon Baker',
    subtitle: 'Friendly little dragon baking golden croissants and sweet pastries',
    category: 'Fantasy',
    likes: '21.5K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Easy',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 120,
    palette: [
      { number: 1, hex: '#FFFFFF', name: 'Chef Hat White' },
      { number: 2, hex: '#10B981', name: 'Emerald Scales' },
      { number: 3, hex: '#F59E0B', name: 'Golden Croissant' },
      { number: 4, hex: '#F43F5E', name: 'Strawberry Glaze' },
      { number: 5, hex: '#8B5CF6', name: 'Pastry Apron' },
      { number: 6, hex: '#B45309', name: 'Bakery Shelves' },
    ],
    objectives: [
      {
        id: 'obj-dragon-chef',
        title: 'Color Dragon Baker',
        objectId: 'dragon',
        deadlineSeconds: 35,
        bonusPoints: 30,
        iconType: 'dragon',
        totalRegions: 4,
      },
      {
        id: 'obj-bakery-croissant',
        title: 'Color Fresh Croissant',
        objectId: 'croissant',
        deadlineSeconds: 65,
        bonusPoints: 30,
        iconType: 'cup',
        totalRegions: 3,
      },
    ],
    regions: [
      // Dragon Chef Hat & Horns
      {
        id: 'db-chef-hat',
        objectId: 'dragon',
        path: 'M 190 70 C 160 30 340 30 310 70 C 300 95 200 95 190 70 Z',
        colorIndex: 1,
        labelPos: { x: 250, y: 65 },
        name: 'Poofy White Chef Toque',
      },
      {
        id: 'db-dragon-head',
        objectId: 'dragon',
        path: 'M 180 110 C 160 170 340 170 320 110 C 310 90 190 90 180 110 Z',
        colorIndex: 2,
        labelPos: { x: 250, y: 130 },
        name: 'Friendly Dragon Green Snout',
      },
      {
        id: 'db-dragon-body',
        objectId: 'dragon',
        path: 'M 170 170 C 140 250 360 250 330 170 Z',
        colorIndex: 2,
        labelPos: { x: 250, y: 200 },
        name: 'Chibi Dragon Body',
      },
      {
        id: 'db-pastry-apron',
        objectId: 'dragon',
        path: 'M 200 180 L 300 180 L 290 280 L 210 280 Z',
        colorIndex: 5,
        labelPos: { x: 250, y: 230 },
        name: 'Baker Lavender Apron',
      },
      // Golden Croissants & Strawberry Tart
      {
        id: 'db-croissant-body',
        objectId: 'croissant',
        path: 'M 140 320 C 120 280 250 280 230 320 C 210 345 160 345 140 320 Z',
        colorIndex: 3,
        labelPos: { x: 185, y: 315 },
        name: 'Flaky Butter Croissant',
      },
      {
        id: 'db-strawberry-tart',
        objectId: 'croissant',
        path: 'M 280 320 C 260 290 350 290 340 320 C 330 340 280 340 280 320 Z',
        colorIndex: 4,
        labelPos: { x: 310, y: 315 },
        name: 'Glazed Strawberry Tart',
      },
      {
        id: 'db-table-counter',
        objectId: 'bakery',
        path: 'M 50 350 L 450 350 L 440 450 L 60 450 Z',
        colorIndex: 6,
        labelPos: { x: 250, y: 400 },
        name: 'Rustic Flour Counter',
      },
    ],
  },

  // 6. AUTUMN FOREST FOX
  {
    id: 'autumn-fox',
    title: 'Autumn Forest Fox',
    subtitle: 'Peaceful red fox curled among oak leaves and wild mushrooms',
    category: 'Cozy',
    likes: '17.3K',
    thumbnail: '', // Uses vector ArtworkThumbnail
    difficulty: 'Medium',
    viewBox: '0 0 500 500',
    defaultDurationSeconds: 120,
    palette: [
      { number: 1, hex: '#FFFFFF', name: 'White Muzzle' },
      { number: 2, hex: '#EA580C', name: 'Fox Autumn Orange' },
      { number: 3, hex: '#DC2626', name: 'Forest Berry Red' },
      { number: 4, hex: '#EAB308', name: 'Golden Oak Leaf' },
      { number: 5, hex: '#65A30D', name: 'Forest Moss' },
      { number: 6, hex: '#78350F', name: 'Acorn Brown' },
    ],
    objectives: [
      {
        id: 'obj-fox-curled',
        title: 'Color Curled Red Fox',
        objectId: 'fox',
        deadlineSeconds: 35,
        bonusPoints: 30,
        iconType: 'dragon',
        totalRegions: 3,
      },
      {
        id: 'obj-autumn-leaves',
        title: 'Color Oak Leaves',
        objectId: 'leaves',
        deadlineSeconds: 70,
        bonusPoints: 30,
        iconType: 'flower',
        totalRegions: 3,
      },
    ],
    regions: [
      {
        id: 'af-fox-body',
        objectId: 'fox',
        path: 'M 140 220 C 110 140 330 130 320 230 C 310 320 120 310 140 220 Z',
        colorIndex: 2,
        labelPos: { x: 230, y: 220 },
        name: 'Curled Fox Orange Coat',
      },
      {
        id: 'af-fox-muzzle',
        objectId: 'fox',
        path: 'M 200 240 C 185 220 260 220 250 240 C 240 265 210 265 200 240 Z',
        colorIndex: 1,
        labelPos: { x: 225, y: 245 },
        name: 'Fox White Fluffy Cheeks',
      },
      {
        id: 'af-fox-tail-tip',
        objectId: 'fox',
        path: 'M 280 250 C 320 220 370 250 350 290 C 320 320 280 290 280 250 Z',
        colorIndex: 1,
        labelPos: { x: 320, y: 270 },
        name: 'Fox Snowy Plume Tail Tip',
      },
      {
        id: 'af-leaf-gold-1',
        objectId: 'leaves',
        path: 'M 80 120 C 60 70 140 80 130 120 C 120 150 75 150 80 120 Z',
        colorIndex: 4,
        labelPos: { x: 105, y: 115 },
        name: 'Crisp Golden Oak Leaf',
      },
      {
        id: 'af-leaf-gold-2',
        objectId: 'leaves',
        path: 'M 320 110 C 310 60 390 70 380 110 C 370 145 320 140 320 110 Z',
        colorIndex: 4,
        labelPos: { x: 350, y: 105 },
        name: 'Autumn Canopy Leaf',
      },
      {
        id: 'af-mushrooms',
        objectId: 'leaves',
        path: 'M 90 320 C 70 290 150 290 130 320 Z',
        colorIndex: 3,
        labelPos: { x: 110, y: 310 },
        name: 'Forest Toadstool Mushroom',
      },
      {
        id: 'af-mossy-ground',
        objectId: 'ground',
        path: 'M 40 350 L 460 350 L 450 460 L 50 460 Z',
        colorIndex: 5,
        labelPos: { x: 250, y: 400 },
        name: 'Lush Woodland Moss Blanket',
      },
    ],
  },
];
