import { HasTags } from "./HasTags";

class Tags extends HasTags {
  constructor() {
    super();
  }
}

describe("HasTags", () => {

  let tags: HasTags;

  beforeEach(() => {
    tags = new Tags()
  })
  it("Should add the tag", () => {
    tags.addTags("test1");
    tags.addTags("test2");
    expect(tags.tags).toEqual(["test1", "test2"]);
  })

  it("Should remove the tag", () => {
    tags.addTags("test1", "test2");
    tags.removeTags("test2");
    expect(tags.tags).toEqual(["test1"]);
  })

  it("Should not add duplicates", () => {
    tags.addTags("test1","test1");
    expect(tags.tags).toEqual(["test1"]);
  })
})
