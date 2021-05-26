import { Column, Entity } from "typeorm";

export type LangCode = "en" | "fr" | "es" | "ko" | "th" | "ja";

@Entity()
export class LanguageDetected {
  @Column()
  code: LangCode;

  @Column()
  percent: number;

  @Column()
  score: number;
}

@Entity()
export class LanguageChunk{
  @Column()
  code: LangCode;

  @Column()
  offset: number;

  @Column()
  bytes: number;
}

@Entity()
export class LanguageDetectionResults {
  @Column()
  reliable: boolean;

  @Column()
  languages: LanguageDetected[]

  @Column()
  chunks: LanguageChunk[]

  isOneOf(codes: LangCode[]){
    return this.languages
      .filter(l => l.percent > 25)
      .map(l => l.code)
      .some(code => codes.includes(code));
  }

}
