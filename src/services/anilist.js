// AniList GraphQL API Client and Media Normalizer
const ANILIST_API_URL = "https://graphql.anilist.co";

/**
 * Execute a GraphQL query against AniList API
 */
export async function fetchAniList(query, variables = {}, token = null) {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables })
    });

    const json = await response.json();

    if (!response.ok || json.errors) {
        const errorMsg = json.errors ? json.errors.map(e => e.message).join(", ") : `HTTP ${response.status}`;
        console.error("[AniList API Error]:", errorMsg);
        throw new Error(errorMsg);
    }

    return json.data;
}

/**
 * Normalizes an AniList media object to be seamlessly compatible with
 * the existing AniLog UI while enriching it with high-res banners and AniList features.
 */
export function normalizeAniListMedia(media) {
    if (!media) return null;

    const titleStr = media.title?.english || media.title?.romaji || media.title?.native || "Untitled";
    const coverUrl = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "";

    // Convert AniList 0-100 score to 0-10 format for backwards compatibility with score badges
    const scoreVal = media.averageScore
        ? Number((media.averageScore / 10).toFixed(1))
        : (media.meanScore ? Number((media.meanScore / 10).toFixed(1)) : null);

    // Format release year
    const yearVal = media.seasonYear || media.startDate?.year || null;

    // Format human-readable status
    let statusText = "Finished Airing";
    if (media.status === "RELEASING") statusText = "Currently Airing";
    else if (media.status === "NOT_YET_RELEASED") statusText = "Not Yet Aired";
    else if (media.status === "CANCELLED") statusText = "Cancelled";
    else if (media.status === "HIATUS") statusText = "On Hiatus";

    // Clean description HTML tags if any remain
    const cleanSynopsis = media.description
        ? media.description.replace(/<[^>]*>?/gm, "").replace(/&quot;/g, '"').replace(/&#039;/g, "'")
        : "";

    // Adapt genres to { name } array for existing components
    const genreArray = Array.isArray(media.genres)
        ? media.genres.map(g => (typeof g === "string" ? { name: g } : g))
        : [];

    // Format trailer URL if available
    const trailerEmbed = media.trailer?.site === "youtube"
        ? { embed_url: `https://www.youtube-nocookie.com/embed/${media.trailer.id}` }
        : null;

    return {
        // Native AniList properties
        id: media.id,
        idMal: media.idMal || null,
        // Backward-compatible identifier so <Link to={`/anime/${anime.mal_id}`}> continues working
        mal_id: media.id,
        title: titleStr,
        title_english: media.title?.english || null,
        title_romaji: media.title?.romaji || null,
        title_japanese: media.title?.native || null,
        coverImage: media.coverImage,
        bannerImage: media.bannerImage || null,
        images: {
            jpg: {
                large_image_url: coverUrl,
                image_url: media.coverImage?.large || coverUrl
            },
            webp: {
                large_image_url: coverUrl
            }
        },
        score: scoreVal,
        averageScore: media.averageScore,
        type: media.format || "TV",
        episodes: media.episodes || null,
        duration: media.duration ? `${media.duration} min` : null,
        status: statusText,
        rawStatus: media.status,
        year: yearVal,
        genres: genreArray,
        synopsis: cleanSynopsis,
        trailer: trailerEmbed,
        season: media.season || null,
        source: media.source || null,
        studios: media.studios?.nodes || [],
        mediaListEntry: media.mediaListEntry || null,
        raw: media
    };
}

// ==================== GRAPHQL QUERIES ====================

export const POPULAR_ANIME_QUERY = `
query ($page: Int = 1, $perPage: Int = 24) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      currentPage
    }
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      averageScore
      format
      episodes
      status
      seasonYear
      startDate {
        year
      }
      genres
      description(asHtml: false)
      trailer {
        id
        site
      }
    }
  }
}
`;

export const AIRING_ANIME_QUERY = `
query ($page: Int = 1, $perPage: Int = 24) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      currentPage
    }
    media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      averageScore
      format
      episodes
      status
      seasonYear
      startDate {
        year
      }
      genres
      description(asHtml: false)
      trailer {
        id
        site
      }
    }
  }
}
`;

export const UPCOMING_ANIME_QUERY = `
query ($page: Int = 1, $perPage: Int = 24) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      currentPage
    }
    media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      averageScore
      format
      episodes
      status
      seasonYear
      startDate {
        year
      }
      genres
      description(asHtml: false)
      trailer {
        id
        site
      }
    }
  }
}
`;

export const SEARCH_ANIME_QUERY = `
query ($search: String, $page: Int = 1, $perPage: Int = 24) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      currentPage
    }
    media(type: ANIME, search: $search, sort: [SEARCH_MATCH, POPULARITY_DESC], isAdult: false) {
      id
      idMal
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      averageScore
      format
      episodes
      status
      seasonYear
      startDate {
        year
      }
      genres
      description(asHtml: false)
      trailer {
        id
        site
      }
    }
  }
}
`;

export const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      english
      romaji
      native
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    averageScore
    meanScore
    format
    episodes
    duration
    status
    season
    seasonYear
    source
    studios(isMain: true) {
      nodes {
        id
        name
      }
    }
    genres
    description(asHtml: false)
    trailer {
      id
      site
    }
    characters(sort: [ROLE, RELEVANCE], perPage: 24) {
      edges {
        role
        node {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          idMal
          title {
            english
            romaji
          }
          format
          status
          coverImage {
            large
            medium
          }
        }
      }
    }
    mediaListEntry {
      id
      status
      score
      progress
    }
  }
}
`;

export const CHARACTER_DOSSIER_QUERY = `
query ($id: Int) {
  Character(id: $id) {
    id
    name {
      full
      native
      alternative
    }
    image {
      large
      medium
    }
    description(asHtml: false)
    gender
    dateOfBirth {
      year
      month
      day
    }
    age
    media(type: ANIME, sort: POPULARITY_DESC, perPage: 12) {
      nodes {
        id
        idMal
        title {
          english
          romaji
        }
        format
        status
        coverImage {
          large
          medium
        }
      }
    }
  }
}
`;

export const VIEWER_QUERY = `
query {
  Viewer {
    id
    name
    about
    avatar {
      large
      medium
    }
    bannerImage
  }
}
`;

export const USER_WATCHLIST_QUERY = `
query ($userId: Int) {
  MediaListCollection(userId: $userId, type: ANIME) {
    lists {
      name
      isCustomList
      status
      entries {
        id
        mediaId
        status
        score
        progress
        updatedAt
        media {
          id
          idMal
          title {
            english
            romaji
            native
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          averageScore
          format
          episodes
          status
          seasonYear
          genres
          description(asHtml: false)
        }
      }
    }
  }
}
`;

// ==================== GRAPHQL MUTATIONS ====================

export const SAVE_MEDIA_LIST_ENTRY_MUTATION = `
mutation ($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int) {
  SaveMediaListEntry(mediaId: $mediaId, status: $status, score: $score, progress: $progress) {
    id
    mediaId
    status
    score
    progress
    updatedAt
  }
}
`;

export const DELETE_MEDIA_LIST_ENTRY_MUTATION = `
mutation ($id: Int) {
  DeleteMediaListEntry(id: $id) {
    deleted
  }
}
`;
