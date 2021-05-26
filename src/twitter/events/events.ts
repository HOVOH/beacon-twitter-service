export const TWITTER_NAMESPACE = "twitter"
export const USER_NAMESPACE = "user"
export const TWEET_NAMESPACE = "tweet"
export const DISCOVERED_EVENT = "discovered"
export const NEW_TWEET_EVENT = "new_tweet"
export const MENTION_EVENT = "mention"
export const PROCESSED = "processed"
export const WILDCARD = "*"

const concat = (...strings: string[]) => strings.join(".")

export const TWEET_DISCOVERED = concat(TWITTER_NAMESPACE, TWEET_NAMESPACE, DISCOVERED_EVENT);
export const USER_DISCOVERED = concat(TWITTER_NAMESPACE, USER_NAMESPACE, DISCOVERED_EVENT);
export const USER_TWEET = concat(TWITTER_NAMESPACE, USER_NAMESPACE, NEW_TWEET_EVENT);
export const TWEET_PROCESSED = concat(TWITTER_NAMESPACE, TWEET_NAMESPACE, PROCESSED);
export const USER_MENTIONNED = concat(TWITTER_NAMESPACE, USER_NAMESPACE, MENTION_EVENT);
