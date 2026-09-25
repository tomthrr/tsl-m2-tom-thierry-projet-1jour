import {
    Discard, dot, float, floor, Fn, fract, hash, If, mix, normalWorld,
    positionLocal, positionViewDirection, normalLocal, pow, saturate, select,
    sin, smoothstep, time, uv, vec2, vec3
} from 'three/tsl'

function cellRandom(id, seed = 0) {
    return hash(id.x.mul(12.9898).add(id.y.mul(78.233)).add(seed))
}

export function createBowlPositionNode(uHoverCell, uNbCells, uAmplitude) {
    return Fn(() => {
        const cellId = floor(uv().mul(uNbCells)).toVar()
        const random = cellRandom(cellId, 0)
        const phase = random.mul(6.283)
        const amplitude = random.mul(uAmplitude)

        const hoverDistance = cellId.distance(uHoverCell)
        const hoverWave = float(1.0).sub(hoverDistance.smoothstep(0.0, 3.0))
        const hasHover = uHoverCell.x.greaterThanEqual(0).and(uHoverCell.y.greaterThanEqual(0))
        const hoverInfluence = select(hasHover, hoverWave, float(0.0))

        const idleMotion = sin(time.mul(0.6).add(phase)).mul(amplitude)
        const hoverMotion = hoverInfluence.mul(uAmplitude)
        const elevation = idleMotion.add(hoverMotion)

        return positionLocal.add(normalLocal.mul(elevation))
    })()
}

export function createBowlColorNode(uBorder, uRoseColor, uSilverColor, uNbCells, uHoverCell, uvColor) {
    return Fn(() => {
        const cellId = floor(uv().mul(uNbCells)).toVar()
        const cellUV = fract(uv().mul(uNbCells))

        // Selection des pixels sur le côté 
        const inside = cellUV.x.greaterThanEqual(uBorder).and(
            cellUV.x.lessThanEqual(float(1.0).sub(uBorder)).and(
                cellUV.y.greaterThanEqual(uBorder).and(
                    cellUV.y.lessThanEqual(float(1.0).sub(uBorder))
                )
            )
        )
        If(inside.not(), () => Discard())

        const hueMix = cellRandom(cellId, 11.0)
        const shadeMix = cellRandom(cellId, 47.0)
        const baseColor = mix(uSilverColor, uRoseColor, pow(hueMix, 1.4))
        const shaded = baseColor.mul(mix(0.82, 1.22, shadeMix))

        // Effet de survol
        const hoverDistance = cellId.distance(uHoverCell)
        const hoverGlow = float(1.0).sub(smoothstep(0.0, 2.5, hoverDistance))
        const hasHover = uHoverCell.x.greaterThanEqual(0).and(uHoverCell.y.greaterThanEqual(0))
        const hoverInfluence = select(hasHover, hoverGlow, float(0.0))

        return mix(shaded, vec3(1.0, 0.96, 0.99), hoverInfluence.mul(0.6))
        // return vec3(normalLocal)
    })()
}

export function createBowlRoughnessNode(uNbCells) {
    return Fn(() => {
        const cellId = floor(uv().mul(uNbCells)).toVar()
        const roughRandom = cellRandom(cellId, 91.0)
        return mix(0.08, 0.34, pow(roughRandom, 2.0))
    })()
}

export function createBowlEmissiveNode(uNbCells, uHoverCell, uSparkleColor, uSparkleIntensity) {
    return Fn(() => {

        const cellId = floor(uv().mul(uNbCells)).toVar()

        // Temps discret → change le scintillement
        const twinkleStep = floor(time.mul(1.5))

        // Aléatoire différent à chaque étape → carreaux qui scintillent
        const twinkleRandom = cellRandom(
            cellId.add(twinkleStep.mul(vec2(0.37, 1.13))),
            133.0
        )

        const facingRandom = cellRandom(cellId, 71.0)

        // Influence selon l'angle de vue
        const fresnel = saturate(
            dot(normalWorld, positionViewDirection).oneMinus()
        )

        // Sélectionne les carreaux qui scintillent
        const glintMask = smoothstep(0.965, 1.0, twinkleRandom)
            .mul(smoothstep(0.15, 0.85, facingRandom))

        // Intensité finale du scintillement
        const sparkle = glintMask
            .mul(uSparkleIntensity)
            .mul(pow(fresnel.oneMinus().add(0.3), 0.5))

        // Distance par rapport au carreau survolé
        const hoverDistance = cellId.distance(uHoverCell)

        // Glow qui diminue avec la distance
        const hoverGlow = float(1.0).sub(
            smoothstep(0.0, 2.0, hoverDistance)
        )

        // Vérifie si un carreau est survolé
        const hasHover = uHoverCell.x.greaterThanEqual(0)
            .and(uHoverCell.y.greaterThanEqual(0))

        // Active le glow uniquement pendant le hover
        const hoverInfluence = select(
            hasHover,
            hoverGlow,
            float(0.0)
        )

        // Combine sparkle + glow du hover
        return uSparkleColor.mul(
            sparkle.add(hoverInfluence.mul(0.8))
        )
    })()
}