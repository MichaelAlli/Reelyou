/** LOCKED REELYOU STAR INTERACTION/DETAIL SYSTEM — do not refactor or alter without explicit product approval. */
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyIdentityProfileBubble } from '@/components/my-sky/MySkyIdentityProfileBubble';
import { MySkyIdentityStar } from '@/components/my-sky/MySkyIdentityStar';
import { MySkyStarInsightBubble } from '@/components/my-sky/MySkyStarInsightBubble';
import {
  useMySkyStarInteraction,
  type MySkyStarInteractionOptions,
} from '@/components/my-sky/useMySkyStarInteraction';
import type { MySkyStarDisplay } from '@/mySky/types';

interface MySkyStarInteractionOverlayProps extends MySkyStarInteractionOptions {
  layoutWidth: number;
  layoutHeight: number;
  showIdentityStar?: boolean;
}

function starAccessibilityLabel(star: MySkyStarDisplay): string {
  if (star.type === 'skywrite' && star.sourceId) {
    return `Open skywrite: ${star.title ?? 'moment'}`;
  }
  if (star.type === 'community') {
    return `Open community: ${star.title ?? 'community'}`;
  }
  if (star.type === 'connection') {
    return `Open connection: ${star.title ?? 'connection'}`;
  }
  if (star.type === 'guidance') {
    return `Open guidance: ${star.title ?? 'guidance'}`;
  }
  if (star.type === 'contribution') {
    return `Open contribution: ${star.title ?? 'impact'}`;
  }
  return star.title ? `View star: ${star.title}` : 'View star';
}

/** Invisible hit targets + shared My Sky detail bubbles (no star/constellation rendering). */
function MySkyStarInteractionOverlayComponent({
  layoutWidth,
  layoutHeight,
  showIdentityStar = true,
  ...interactionOptions
}: MySkyStarInteractionOverlayProps) {
  const interaction = useMySkyStarInteraction(interactionOptions);
  const {
    stars,
    identityStar,
    skyOwner,
    insightStar,
    insightOpen,
    insightDetail,
    bubbleOpen,
    missingHint,
    ownBubbleActive,
    closeInsightBubble,
    closeProfileBubble,
    handleStarPress,
    handleOwnIdentityPress,
    handleOpenInsightDetail,
    insightActionAvailable,
    handleViewProfile,
  } = interaction;

  if (layoutWidth <= 0 || layoutHeight <= 0) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {showIdentityStar ? (
        <MySkyIdentityStar
          star={identityStar}
          worldWidth={layoutWidth}
          worldHeight={layoutHeight}
          active={ownBubbleActive}
          prominence={1.06}
          onPress={handleOwnIdentityPress}
        />
      ) : null}

      {stars.map((star) => (
        <Pressable
          key={star.id}
          accessibilityRole="button"
          accessibilityLabel={starAccessibilityLabel(star)}
          onPress={() => handleStarPress(star)}
          style={[
            styles.starHit,
            {
              left: `${star.x * 100}%`,
              top: `${star.y * 100}%`,
            },
          ]}>
          <View style={styles.hitGlow} />
        </Pressable>
      ))}

      <MySkyIdentityProfileBubble
        owner={skyOwner}
        anchorStar={identityStar}
        visible={bubbleOpen}
        canViewFullSky={false}
        onClose={closeProfileBubble}
        onViewProfile={handleViewProfile}
      />

      <MySkyStarInsightBubble
        star={insightStar}
        detail={insightDetail}
        visible={insightOpen}
        onClose={closeInsightBubble}
        onOpenDetail={insightActionAvailable ? handleOpenInsightDetail : undefined}
      />

      {missingHint ? (
        <View style={styles.missingHintWrap} pointerEvents="none">
          <Text style={styles.missingHint}>{missingHint}</Text>
        </View>
      ) : null}
    </View>
  );
}

export const MySkyStarInteractionOverlay = memo(MySkyStarInteractionOverlayComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 24,
  },
  starHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  hitGlow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.01,
  },
  missingHintWrap: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  missingHint: {
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.72)',
  },
});
