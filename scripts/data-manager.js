// DATA MANAGER
const DataManager = {

  _key() {
    const user = Auth.getCurrentUser();
    return user ? `para_landmarks_${user.id}` : null;
  },

  getLandmarks() {
    const key = this._key();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  saveLandmarks(landmarks) {
    const key = this._key();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(landmarks));
  },

  getLandmark(id) {
    return this.getLandmarks().find(l => l.id === id) || null;
  },

  addLandmark(name, category, description, lat, lng) {
    const landmarks = this.getLandmarks();
    const landmark = {
      id: 'lm_' + Date.now(),
      name,
      category,
      description,
      lat,
      lng,
      createdAt: new Date().toISOString()
    };
    landmarks.push(landmark);
    this.saveLandmarks(landmarks);
    return landmark;
  },

  updateLandmark(id, name, category, description) {
    const landmarks = this.getLandmarks();
    const idx = landmarks.findIndex(l => l.id === id);
    if (idx === -1) return false;
    Object.assign(landmarks[idx], { name, category, description });
    this.saveLandmarks(landmarks);
    return true;
  },

  deleteLandmark(id) {
    this.saveLandmarks(this.getLandmarks().filter(l => l.id !== id));
    return true;
  }

};