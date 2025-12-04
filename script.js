let musicData = null;
let allTracks = [];

async function loadMusicData() {
    try {
        const response = await fetch('music_recommendations.json');
        const data = await response.json();
        musicData = data;
        allTracks = data.tracks;
    } catch (error) {
    }
}

function filterTracks(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const matches = [];
    
    for (const track of allTracks) {
        const titleMatch = track.title.toLowerCase().includes(lowerQuery);
        const artistMatch = track.artist.toLowerCase().includes(lowerQuery);
        
        if (titleMatch || artistMatch) {
            matches.push(track);
        }
        
        if (matches.length >= 10) {
            break;
        }
    }
    
    return matches;
}

function showSuggestions(matches) {
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (matches.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'block';
    
    matches.forEach(track => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <div class="suggestion-title">${escapeHtml(track.title)}</div>
            <div class="suggestion-artist">${escapeHtml(track.artist)}</div>
            <div class="suggestion-genre">${escapeHtml(track.genre)}</div>
        `;
        
        item.addEventListener('click', () => {
            selectTrack(track);
            suggestionsDiv.style.display = 'none';
            document.getElementById('searchInput').value = `${track.artist} - ${track.title}`;
        });
        
        suggestionsDiv.appendChild(item);
    });
}

function selectTrack(track) {
    const selectedDiv = document.getElementById('selectedTrack');
    selectedDiv.innerHTML = `
        <div class="selected-track-title">${escapeHtml(track.title)}</div>
        <div class="selected-track-artist">${escapeHtml(track.artist)}</div>
        <div class="selected-track-genre">${escapeHtml(track.genre)}</div>
    `;
    selectedDiv.style.display = 'block';
}

function showSimilarTracks(track) {
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    if (!track || !track.similar_tracks || track.similar_tracks.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">No similar tracks found.</div>';
        return;
    }
    
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    setTimeout(() => {
        loadingDiv.style.display = 'none';
        
        resultsDiv.innerHTML = '<div class="results-title">Similar Tracks:</div>';
        
        track.similar_tracks.forEach(similar => {
            const similarTrack = allTracks.find(t => t.idx === similar.idx);
            
            if (similarTrack) {
                const card = document.createElement('div');
                card.className = 'track-card';
                card.innerHTML = `
                    <div class="track-card-header">
                        <div>
                            <div class="track-card-title">${escapeHtml(similarTrack.title)}</div>
                            <div class="track-card-artist">${escapeHtml(similarTrack.artist)}</div>
                            <div class="track-card-genre">${escapeHtml(similarTrack.genre)}</div>
                        </div>
                        <div class="similarity-score">${(similar.similarity * 100).toFixed(1)}%</div>
                    </div>
                `;
                resultsDiv.appendChild(card);
            }
        });
        
        if (resultsDiv.children.length === 1) {
            resultsDiv.innerHTML = '<div class="no-results">No similar tracks found.</div>';
        }
    }, 300);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    
    if (!query) {
        return;
    }
    
    const matches = filterTracks(query);
    
    if (matches.length === 0) {
        return;
    }
    
    if (matches.length === 1) {
        const track = matches[0];
        selectTrack(track);
        showSimilarTracks(track);
    } else {
        const exactMatch = matches.find(t => 
            `${t.artist} - ${t.title}`.toLowerCase() === query.toLowerCase()
        );
        
        if (exactMatch) {
            selectTrack(exactMatch);
            showSimilarTracks(exactMatch);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMusicData();
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length >= 2) {
            const matches = filterTracks(query);
            showSuggestions(matches);
        } else {
            document.getElementById('suggestions').style.display = 'none';
        }
    });
    
    searchButton.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('suggestions').style.display = 'none';
        }
    });
});

