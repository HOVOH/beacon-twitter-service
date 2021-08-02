export const TWITTER_NAMESPACE = "twitter"
export const USER_NAMESPACE = "user"
export const TWEET_NAMESPACE = "tweet"
export const DISCOVERED_EVENT = "discovered"
export const NEW_TWEET_EVENT = "new_tweet"
export const MENTION_EVENT = "mention"
export const PROCESSED = "processed"
export const WILDCARD = "*"
export const FOLLOWING = "following"

const concat = (...strings: string[]) => strings.join(".")

export const TWEET_SAMPLED = concat(TWITTER_NAMESPACE, TWEET_NAMESPACE, "sampled");
export const USER_FOLLOWING = concat(TWITTER_NAMESPACE, USER_NAMESPACE, FOLLOWING);
export const USER_TWEET = concat(TWITTER_NAMESPACE, USER_NAMESPACE, "tweet");
