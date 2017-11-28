export class Variation {
  data: any = {};

  constructor(data: any) {
    this.data = data;
  }

  id(): string {
    return this.data.id;
  }

  ref(): string {
    return this.data.ref;
  }

  label(): string {
    return this.data.label;
  }
}

export class Experiment {
  variations: Variation[];
  data: any = {};

  constructor(data: any) {
    this.data = data;
    this.variations = (data.variations || []).map((v: any) => {
      return new Variation(v);
    });
  }

  id(): string {
    return this.data.id;
  }

  googleId(): string {
    return this.data.googleId;
  }

  name(): string {
    return this.data.name;
  }
}

export class Experiments {
  drafts: Experiment[];
  running: Experiment[];

  constructor(data: any) {
    if (data) {
      this.drafts = (data.drafts || []).map((exp: any) => {
        return new Experiment(exp);
      });
      this.running = (data.running || []).map((exp: any) => {
        return new Experiment(exp);
      });
    }
  }

  current(): Experiment | null {
    if (this.running.length > 0) {
      return this.running[0];
    } else {
      return null;
    }
  }
  refFromCookie(cookie: string): string | null {
    if (!cookie || cookie.trim() === '') return null;
    const splitted = cookie.trim().split(' ');
    if (splitted.length < 2) return null;
    const expId = splitted[0];
    const varIndex = parseInt(splitted[1], 10);
    const exp = this.running.filter((exp) => {
      return exp.googleId() === expId && exp.variations.length > varIndex;
    })[0];
    return exp ? exp.variations[varIndex].ref() : null;
  }
}
