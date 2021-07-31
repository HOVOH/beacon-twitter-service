import { TimeSeries } from "./timeseries.entity";

describe("Timeseries", () => {
  it("Should add an item to the values", () => {
    const ts = new TimeSeries<number>();
    ts.add(new Date(), 1);
    ts.add(new Date(), 2);
    expect(ts.values.length).toEqual(2);
    expect(ts.values).toEqual([1,2]);
    expect(ts.length).toEqual(2);
  })

  it("Should return last item", () => {
    const ts = new TimeSeries<number>();
    ts.add(new Date(), 1);
    const date = new Date();
    ts.add(date, 2);
    expect(ts.isEmpty()).toBe(false);
    expect(ts.last().right).toEqual(2);
    expect(ts.last().left).toEqual(date);
  })

  it("Should return null if empty", () => {
    const ts = new TimeSeries();
    expect(ts.isEmpty()).toBe(true);
    expect(ts.last().right).toBeNull();
    expect(ts.last().left).toBeNull();
  })

})
