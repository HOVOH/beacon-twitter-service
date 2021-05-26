import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { ITweetSample } from "../api/tweet-sample";
import { TweetMeta } from "./tweet-meta.entity";
import { ITweet } from "../api/tweet";
import { Exclude } from "class-transformer";

@Entity()
export class Tweet {
  @Exclude()
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  tweetId: string;

  @Column()
  text: string;

  @Column()
  authorId: string;

  @Column()
  createdAt:Date

  @Column()
  conversationId: string

  @Column()
  source: string

  @Column(type => TweetMeta)
  meta: TweetMeta

  @CreateDateColumn() public foundAt: Date;
  @UpdateDateColumn() public updatedAt: Date;

  static fromITweetSample(packet: ITweetSample): Tweet{
    const {data: iTweet} = packet;
    return this.fromITweet(iTweet);
  }

  static fromITweet(iTweet: ITweet): Tweet{
    const tweet = new Tweet();
    tweet.tweetId = iTweet.id;
    tweet.text = iTweet.text;
    tweet.authorId = iTweet.author_id;
    tweet.createdAt = new Date(iTweet.created_at);
    tweet.conversationId = iTweet.conversation_id;
    tweet.source = iTweet.source;
    tweet.meta = TweetMeta.fromITweet(iTweet);
    return tweet;
  }

}
