import { Column, Entity } from "typeorm";
import { Label } from "../../labeling/label.entity";
import { LanguageDetectionResults } from "../../labeling/language-detection-results.entity";
import { IHashtag, IMention, ITweet, ITweetReference, IUrl } from "../api/tweet";
import { Expose, plainToClass } from "class-transformer";
import { HasTags } from "../../utils/HasTags";

@Entity()
export class Hashtag{
  @Column()
  start: number;

  @Column()
  end: number;

  @Column()
  tag: string;

  static fromIHashtag(hashtag:IHashtag){
    return plainToClass(Hashtag, hashtag);
  }

}

@Entity()
export class Mention{
  @Column()
  start: number;
  @Column()
  end: number;
  @Column()
  username: string;

  static fromIMention(mention: IMention){
    return plainToClass(Mention, mention);
  }

}

@Entity()
export class Url {
  @Column()
  start: number;

  @Column()
  end: number;

  @Column()
  url: string;

  @Column()
  expandedUrl: string;

  @Column()
  displayUrl: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  unwoundUrl: string;

  static fromIUrl(iurl: IUrl){
    const url = new Url()
    url.start = iurl.start;
    url.end = iurl.end;
    url.url = iurl.url;
    url.expandedUrl = iurl.expanded_url;
    url.displayUrl = iurl.display_url;
    url.title = iurl.title;
    url.description = iurl.description;
    url.unwoundUrl = iurl.unwound_url;
    return url;
  }
}

@Entity()
export class TweetReference{
  type: "replied_to"|"quoted"|"retweeted";
  id:string;

  static fromITweetReference(iRef: ITweetReference){
    const ref = new TweetReference();
    ref.id = iRef.id;
    ref.type = iRef.type;
    return ref;
  }
}

@Entity()
export class TweetMeta extends HasTags{

  @Column()
  tweetScore: number;

  @Column(type => Label)
  private _topics: Label<string[]>[];

  @Column()
  topicsScore: {[k:string ]: number}

  @Column()
  lang: LanguageDetectionResults;

  @Column()
  source: string;

  @Column(type => Hashtag)
  hashtags: Hashtag[]

  @Column(type=>Mention)
  mentions: Mention[]

  @Column(type=>Url)
  urls: Url[]

  @Column(type=> TweetReference)
  references: TweetReference[]

  @Expose()
  get topics() {
    if (this._topics){
      return new Set(this._topics.flatMap(labels => labels.label))
    }
    return [];
  }

  addTopic(assigner: string, topic: string[]){
    if (!this._topics){
      this._topics = []
    }
    let topics = this._topics
      .find(topics => topics.assignedBy === assigner)
    if (topics){
      topics.label.push(...topic);
    }else {
      topics = new Label<string[]>();
      topics.assignedBy = assigner;
      topics.label = topic;
      this._topics.push(topics)
    }
  }

  static fromITweet(tweet: ITweet){
    const meta = new TweetMeta();
    if (tweet.entities){
      if (tweet.entities.mentions){
        meta.mentions = tweet.entities.mentions.map(Mention.fromIMention)
      }
      if(tweet.entities.hashtags){
        meta.hashtags = tweet.entities.hashtags.map(Hashtag.fromIHashtag)
      }
      if (tweet.entities.urls){
        meta.urls = tweet.entities.urls.map(Url.fromIUrl);
      }
      if (tweet.referenced_tweets){
        meta.references = tweet.referenced_tweets.map(TweetReference.fromITweetReference);
      }
    }
    return meta;
  }

}
