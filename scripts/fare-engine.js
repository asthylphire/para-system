// EMBEDDED FALLBACK DATA
const FARE_MATRIX_FALLBACK = {
    updated: "2026",
    source:  "LTFRB",
    types: {
        bus_aircon:          { label: "Bus (Aircon)",        baseFare: 15.00, baseKm: 5, excessPerKm: 2.65 },
        bus_ordinary:        { label: "Bus (Ordinary)",      baseFare: 13.00, baseKm: 5, excessPerKm: 2.20 },
        modern_jeepney:      { label: "Modern Jeepney",      baseFare: 14.00, baseKm: 4, excessPerKm: 2.35 },
        traditional_jeepney: { label: "Traditional Jeepney", baseFare: 13.00, baseKm: 4, excessPerKm: 1.80 }
    },
    discounts: {
        regular: { label: "Regular",        rate: 0    },
        student: { label: "Student",        rate: 0.20 },
        senior:  { label: "Senior Citizen", rate: 0.20 },
        pwd:     { label: "PWD",            rate: 0.20 }
    }
};

let cachedMatrix = null;

// LOAD FARE MATRIX
async function loadFareMatrix() {
    if (cachedMatrix) return cachedMatrix;

    try {
        const response = await fetch('../assets/fare-matrix.json');

        if (!response.ok) {
            throw new Error('HTTP error: ' + response.status);
        }

        cachedMatrix = await response.json();
        console.log('[FareEngine] Loaded fare matrix from server (2026 rates)');
        return cachedMatrix;

    } catch (err) {
        console.warn('[FareEngine] Could not fetch fare matrix, using built-in data.', err.message);
        cachedMatrix = FARE_MATRIX_FALLBACK;
        return cachedMatrix;
    }
}

// CALCULATE FARE
async function calculateFare(distanceKm, transportType, passengerType) {
    const matrix = await loadFareMatrix();
    if (!matrix) return null;

    const transport = matrix.types[transportType];
    const discount  = matrix.discounts[passengerType];
    if (!transport || !discount) return null;

    const { baseFare, baseKm, excessPerKm, label: transportLabel } = transport;
    const { label: passengerLabel, rate: discountRate } = discount;

    const excessKm   = Math.max(0, distanceKm - baseKm);
    const excessFare = excessKm * excessPerKm;

    const subtotal    = baseFare + excessFare;
    const discountAmt = subtotal * discountRate;
    const total       = subtotal - discountAmt;

    return {
        distance:       distanceKm.toFixed(2),
        transportLabel,
        baseFare:       baseFare.toFixed(2),
        excessFare:     excessFare.toFixed(2),
        passengerType:  passengerLabel,
        discountRate:   (discountRate * 100).toFixed(0),
        discountAmount: discountAmt.toFixed(2),
        total:          total.toFixed(2)
    };
}

// DISTANCE FORMULA (HAVERSINE)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R    = 6371;
    const dLat = toRad(lat2 - lat1);``
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}