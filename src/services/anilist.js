// AniList GraphQL API Client and Media Normalizer
const ANILIST_API_URL = "https://graphql.anilist.co";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format AniList fuzzy date { year, month, day } to readable date string
 */
export function formatAniListDate(dateObj) {
    if (!dateObj || !dateObj.year) return null;
    const { year, month, day } = dateObj;
    if (month && day) {
        return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
    }
    if (month) {
        return `${MONTH_NAMES[month - 1]} ${year}`;
    }
    return `${year}`;
}

/**
 * Format start and end dates into an aired range e.g. "Oct 20, 1999 to Present"
 */
export function formatAiredRange(startDate, endDate, status) {
    const startStr = formatAniListDate(startDate);
    const endStr = formatAniListDate(endDate);

    if (startStr && endStr) {
        return startStr === endStr ? startStr : `${startStr} to ${endStr}`;
    }
    if (startStr && !endStr) {
        if (status === "RELEASING") return `${startStr} to Present`;
        return startStr;
    }
    if (!startStr && endStr) return `Until ${endStr}`;
    return null;
}

/**
 * Derive clean content/age advisory rating from adult flag and genres
 */
export function deriveContentRating(media) {
    if (!media) return 'PG-13 - Teens 13+';
    if (media.isAdult) return 'R - 18+ (Adult)';
    const genres = Array.isArray(media.genres)
        ? media.genres.map(g => (typeof g === 'string' ? g : g?.name || ''))
        : [];
    if (genres.includes('Kids')) return 'G - All Ages';
    if (genres.includes('Ecchi') || genres.includes('Harem')) return 'PG-13 - Teens 13+';
    if (genres.includes('Horror') || genres.includes('Psychological')) return 'R - 17+ (Violence)';
    return 'PG-13 - Teens 13+';
}

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
    if (media._isNormalized) return media;

    const titleStr = typeof media.title === "string"
        ? media.title
        : (media.title?.english || media.title?.romaji || media.title?.native || "Untitled");
    const coverUrl = media.coverImage?.extraLarge ||
        media.coverImage?.large ||
        media.coverImage?.medium ||
        media.images?.webp?.large_image_url ||
        media.images?.jpg?.large_image_url ||
        media.images?.jpg?.image_url ||
        "";

    // Convert AniList 0-100 score to 0-10 format for backwards compatibility with score badges
    const scoreVal = typeof media.score === "number" && media.score <= 10
        ? media.score
        : (media.averageScore
            ? Number((media.averageScore / 10).toFixed(1))
            : (media.meanScore ? Number((media.meanScore / 10).toFixed(1)) : null));

    // Format release year
    const yearVal = media.seasonYear || media.year || media.startDate?.year || null;

    // Episode counting:
    // Ongoing anime (like One Piece) have media.episodes = null in AniList.
    // nextAiringEpisode.episode - 1 gives the current released episode count (e.g. 1122+).
    const currentAiredEpisode = media.nextAiringEpisode?.episode
        ? media.nextAiringEpisode.episode - 1
        : null;
    const totalEpisodes = media.episodes || currentAiredEpisode || null;
    const isOngoing = (media.status === "RELEASING" && !media.episodes) || (!media.episodes && !!currentAiredEpisode);

    // Format human-readable status
    let statusText = "Finished Airing";
    if (media.status === "RELEASING" || media.status === "Currently Airing") statusText = "Currently Airing";
    else if (media.status === "NOT_YET_RELEASED" || media.status === "Not Yet Aired") statusText = "Not Yet Aired";
    else if (media.status === "CANCELLED") statusText = "Cancelled";
    else if (media.status === "HIATUS") statusText = "On Hiatus";

    // Clean description HTML tags if any remain
    const cleanSynopsis = media.description || media.synopsis
        ? String(media.description || media.synopsis).replace(/<[^>]*>?/gm, "").replace(/&quot;/g, '"').replace(/&#039;/g, "'")
        : "";

    // Adapt genres to { name } array for existing components
    const genreArray = Array.isArray(media.genres)
        ? media.genres.map(g => (typeof g === "string" ? { name: g } : g))
        : [];

    // Format trailer URL if available
    const trailerEmbed = media.trailer?.site === "youtube"
        ? { embed_url: `https://www.youtube-nocookie.com/embed/${media.trailer.id}` }
        : (media.trailer?.site === "dailymotion"
            ? { embed_url: `https://www.dailymotion.com/embed/video/${media.trailer.id}` }
            : (media.trailer?.embed_url ? { embed_url: media.trailer.embed_url } : null));

    // Aired date range string
    const airedString = formatAiredRange(media.startDate, media.endDate, media.status) || (yearVal ? String(yearVal) : null);

    // Content Rating
    const ratingStr = deriveContentRating(media);

    // Ranking (extract all-time rated rank)
    const ratedRankObj = Array.isArray(media.rankings)
        ? (media.rankings.find(r => r.type === "RATED" && r.allTime) || media.rankings.find(r => r.type === "RATED") || media.rankings[0])
        : null;
    const rankVal = ratedRankObj?.rank || null;

    // Popularity rank (extract all-time popular rank)
    const popularRankObj = Array.isArray(media.rankings)
        ? (media.rankings.find(r => r.type === "POPULAR" && r.allTime) || media.rankings.find(r => r.type === "POPULAR"))
        : null;
    const popularityVal = popularRankObj?.rank || null;

    // Scored By (sum of distribution of users who rated this anime)
    const scoredByVal = Array.isArray(media.stats?.scoreDistribution)
        ? media.stats.scoreDistribution.reduce((acc, curr) => acc + (curr.amount || 0), 0)
        : null;

    // Primary Studio
    const studioList = media.studios?.nodes || [];
    const mainStudio = studioList[0]?.name || null;

    // Lineage Recommendations (From Studio, Author/Director, and Community)
    const mainStudioEdge = (media.studios?.edges || []).find(e => e.isMain || e.node?.isAnimationStudio) || media.studios?.edges?.[0];
    const studioName = mainStudioEdge?.node?.name || mainStudio || null;
    const studioWorksRaw = mainStudioEdge?.node?.media?.nodes || [];
    const studioWorks = studioWorksRaw
        .filter(m => m && m.id !== media.id)
        .map(m => ({
            id: m.id,
            mal_id: m.id,
            name: m.title?.english || m.title?.romaji || m.title?.native || 'Unknown Title',
            image: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium,
            format: m.format,
            year: m.seasonYear,
            score: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : null,
            episodes: m.episodes,
            genres: m.genres || [],
            lineageType: 'STUDIO',
            lineageLabel: `STUDIO // ${studioName ? studioName.toUpperCase() : 'PRODUCTION'}`,
            creatorName: studioName
        }));

    // Author / Director / Creator Lineage
    const staffEdges = media.staff?.edges || [];
    const keyRoles = ['Original Creator', 'Original Story', 'Author', 'Director', 'Series Director'];
    let primaryStaff = null;
    for (const roleName of keyRoles) {
        const found = staffEdges.find(e => e.role && e.role.toLowerCase().includes(roleName.toLowerCase()) && e.node?.staffMedia?.nodes?.length > 0);
        if (found) {
            primaryStaff = found;
            break;
        }
    }
    if (!primaryStaff && staffEdges.length > 0) {
        primaryStaff = staffEdges.find(e => e.node?.staffMedia?.nodes?.length > 0);
    }

    const creatorName = primaryStaff?.node?.name?.full || null;
    const creatorRole = primaryStaff?.role || 'Creator';
    const creatorWorksRaw = primaryStaff?.node?.staffMedia?.nodes || [];
    const creatorWorks = creatorWorksRaw
        .filter(m => m && m.id !== media.id)
        .map(m => ({
            id: m.id,
            mal_id: m.id,
            name: m.title?.english || m.title?.romaji || m.title?.native || 'Unknown Title',
            image: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium,
            format: m.format,
            year: m.seasonYear,
            score: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : null,
            episodes: m.episodes,
            genres: m.genres || [],
            lineageType: 'CREATOR',
            lineageLabel: `${creatorRole.toUpperCase()} // ${creatorName ? creatorName.toUpperCase() : 'AUTHOR'}`,
            creatorName: creatorName
        }));

    // Community Affinity Recommendations
    const recNodes = media.recommendations?.nodes || [];
    const communityRecs = recNodes
        .map(r => r.mediaRecommendation)
        .filter(m => m && m.id !== media.id)
        .map(m => ({
            id: m.id,
            mal_id: m.id,
            name: m.title?.english || m.title?.romaji || m.title?.native || 'Unknown Title',
            image: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium,
            format: m.format,
            year: m.seasonYear,
            score: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : null,
            episodes: m.episodes,
            genres: m.genres || [],
            lineageType: 'COMMUNITY',
            lineageLabel: 'COMMUNITY AFFINITY',
            creatorName: 'Fan Recommended'
        }));

    // Deduplicated combined lineage recommendations
    const seenIds = new Set();
    const lineageRecommendations = [];
    const addDeduplicated = (items) => {
        items.forEach(it => {
            if (!seenIds.has(it.id)) {
                seenIds.add(it.id);
                lineageRecommendations.push(it);
            }
        });
    };
    addDeduplicated(creatorWorks);
    addDeduplicated(studioWorks);
    addDeduplicated(communityRecs);

    // Season string with year if available
    let seasonStr = media.season || null;
    if (seasonStr && yearVal) {
        seasonStr = `${seasonStr} ${yearVal}`;
    }

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
        episodes: totalEpisodes,
        currentAiredEpisode,
        isOngoing,
        duration: media.duration ? `${media.duration} min` : null,
        status: statusText,
        rawStatus: media.status,
        year: yearVal,
        genres: genreArray,
        synopsis: cleanSynopsis,
        trailer: trailerEmbed,
        season: seasonStr,
        source: media.source || null,
        studio: mainStudio,
        studios: studioList,
        studioLineage: { name: studioName, works: studioWorks },
        creatorLineage: { name: creatorName, role: creatorRole, works: creatorWorks },
        communityRecs,
        lineageRecommendations,
        aired: { string: airedString },
        airedString,
        rating: ratingStr,
        rank: rankVal,
        popularity: popularityVal,
        members: media.popularity || null,
        scored_by: scoredByVal,
        mediaListEntry: media.mediaListEntry || null,
        _isNormalized: true,
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
      nextAiringEpisode {
        episode
      }
      status
      seasonYear
      startDate {
        year
        month
        day
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
      nextAiringEpisode {
        episode
      }
      status
      seasonYear
      startDate {
        year
        month
        day
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
      nextAiringEpisode {
        episode
      }
      status
      seasonYear
      startDate {
        year
        month
        day
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
      nextAiringEpisode {
        episode
      }
      status
      seasonYear
      startDate {
        year
        month
        day
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
    nextAiringEpisode {
      episode
      airingAt
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    duration
    status
    season
    seasonYear
    source
    isAdult
    popularity
    rankings {
      id
      rank
      type
      format
      year
      season
      allTime
      context
    }
    stats {
      scoreDistribution {
        score
        amount
      }
      statusDistribution {
        status
        amount
      }
    }
    studios(isMain: true) {
      nodes {
        id
        name
        isAnimationStudio
      }
      edges {
        isMain
        node {
          id
          name
          isAnimationStudio
          media(sort: [POPULARITY_DESC, SCORE_DESC], perPage: 12) {
            nodes {
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
              }
              format
              episodes
              seasonYear
              averageScore
              genres
            }
          }
        }
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
          type
          title {
            english
            romaji
          }
          format
          status
          seasonYear
          averageScore
          episodes
          coverImage {
            large
            medium
          }
        }
      }
    }
    staff(sort: [RELEVANCE], perPage: 15) {
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
          primaryOccupations
          staffMedia(sort: [POPULARITY_DESC, SCORE_DESC], perPage: 12) {
            nodes {
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
              }
              format
              episodes
              seasonYear
              averageScore
              genres
            }
          }
        }
      }
    }
    recommendations(sort: [RATING_DESC], perPage: 15) {
      nodes {
        rating
        mediaRecommendation {
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
          }
          format
          episodes
          seasonYear
          averageScore
          genres
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
    favourites
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
          nextAiringEpisode {
            episode
          }
          status
          seasonYear
          startDate {
            year
            month
            day
          }
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
