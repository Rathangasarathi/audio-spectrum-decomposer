# Audio Spectrum Decomposer Roadmap

## Vision
Build an interactive audio analysis tool that makes it easy to record, visualize, isolate, and export audio content using waveform, spectrogram, and reconstruction workflows.

## Phase 1: MVP

### Core features
- Microphone recording in-browser
- Real-time waveform visualization
- STFT spectrogram generation
- User-selectable spectrogram regions
- Inverse STFT reconstruction of selected audio
- WAV export for isolated audio

### Stability and polish
- Responsive UI and clean layout
- Basic error handling for microphone access
- Local playback support for reconstructed audio
- Cross-browser compatibility checks for Web Audio APIs

## Phase 2: Enhanced editing

### Interaction improvements
- Region zoom and pan controls
- Multi-region selection and editing
- Time/frequency snapping guides
- Undo/redo for selection actions

### Export and sharing
- Export selection as MP3 in addition to WAV
- Save/load project state
- Share reconstructed audio via download link or file picker

## Phase 3: Intelligence and analysis

### AI and signal processing
- AI-powered source separation for vocals/instruments
- Noise reduction and background removal
- Sound classification and metadata tagging
- Additional transforms: wavelet analysis, mel spectrograms

### Advanced workflow
- Live isolation mode for real-time frequency filtering
- Preset filters and effect chains
- Batch processing of imported audio files

## Phase 4: Platform and collaboration

### UX and platform
- Mobile-friendly recording and visualization
- Plugin or embeddable component support
- Collaboration features: annotate and share sessions

### Documentation
- Complete user guide and tutorials
- API docs for backend/audio processing utilities
- Developer contribution guide
