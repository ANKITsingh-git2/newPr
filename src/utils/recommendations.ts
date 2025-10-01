import { Resource, StartupProfile, UserInteraction, RecommendationResult } from '../types';

export function generateRecommendations(
  resources: Resource[],
  profile: StartupProfile,
  interactions: UserInteraction[]
): RecommendationResult[] {
  const scored = resources.map(resource => {
    let score = 0;
    const reasons: string[] = [];

    if (profile.industry && resource.industry_tags.includes(profile.industry)) {
      score += 0.3;
      reasons.push(`matches your ${profile.industry} industry`);
    }

    if (profile.stage && resource.stage_tags.includes(profile.stage)) {
      score += 0.3;
      reasons.push(`relevant for ${profile.stage} stage`);
    }

    const hasInteracted = interactions.some(i => i.resource_id === resource.id);
    if (hasInteracted) {
      score -= 0.5;
    }

    if (resource.rating_avg >= 4.5) {
      score += 0.2;
      reasons.push('highly rated by other founders');
    }

    if (resource.view_count > 10000) {
      score += 0.1;
      reasons.push('popular with the community');
    }

    const userInteractedTags = interactions
      .map(i => resources.find(r => r.id === i.resource_id))
      .filter(Boolean)
      .flatMap(r => r!.tags);

    const tagOverlap = resource.tags.filter(tag =>
      userInteractedTags.includes(tag)
    ).length;

    if (tagOverlap > 0) {
      score += tagOverlap * 0.05;
      reasons.push('similar to resources you viewed');
    }

    const reasoning = reasons.length > 0
      ? reasons.join(', ')
      : 'recommended for startups like yours';

    return {
      resource,
      score: Math.min(Math.max(score, 0), 1),
      reasoning: reasoning.charAt(0).toUpperCase() + reasoning.slice(1)
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export function contentBasedFilter(
  resources: Resource[],
  targetResource: Resource
): Resource[] {
  const scored = resources
    .filter(r => r.id !== targetResource.id)
    .map(resource => {
      let score = 0;

      if (resource.category === targetResource.category) {
        score += 0.3;
      }

      const tagOverlap = resource.tags.filter(tag =>
        targetResource.tags.includes(tag)
      ).length;
      score += tagOverlap * 0.1;

      if (resource.difficulty_level === targetResource.difficulty_level) {
        score += 0.1;
      }

      const industryOverlap = resource.industry_tags.filter(tag =>
        targetResource.industry_tags.includes(tag)
      ).length;
      score += industryOverlap * 0.15;

      return { resource, score };
    })
    .filter(r => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored.map(s => s.resource);
}

export function collaborativeFilter(
  resources: Resource[],
  userInteractions: UserInteraction[],
  allInteractions: UserInteraction[]
): Resource[] {
  const userResourceIds = userInteractions.map(i => i.resource_id);

  const similarUsers = new Map<string, number>();

  allInteractions.forEach(interaction => {
    if (interaction.user_id !== userInteractions[0]?.user_id &&
        userResourceIds.includes(interaction.resource_id)) {
      const count = similarUsers.get(interaction.user_id) || 0;
      similarUsers.set(interaction.user_id, count + 1);
    }
  });

  const topSimilarUsers = Array.from(similarUsers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId]) => userId);

  const recommendedResourceIds = new Map<string, number>();

  allInteractions.forEach(interaction => {
    if (topSimilarUsers.includes(interaction.user_id) &&
        !userResourceIds.includes(interaction.resource_id)) {
      const count = recommendedResourceIds.get(interaction.resource_id) || 0;
      recommendedResourceIds.set(interaction.resource_id, count + 1);
    }
  });

  const topResourceIds = Array.from(recommendedResourceIds.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([resourceId]) => resourceId);

  return resources.filter(r => topResourceIds.includes(r.id));
}
