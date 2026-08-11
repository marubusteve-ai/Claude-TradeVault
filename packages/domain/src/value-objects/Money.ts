/**
 * Money value object — immutable, currency-safe monetary amount.
 *
 * Every amount is stored internally as integer minor units (cents) rather
 * than a floating point major-unit number. This is the single most common
 * source of silent P&L drift in home-grown trading tools: summing hundreds
 * of floating point dollar amounts accumulates rounding error that eventually
 * shows up as an equity curve that doesn't reconcile with the broker
 * statement. Every arithmetic operation here works on integers instead.
 */
export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF" | "NZD" | (string & {});

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND"]);

export class Money {
  private readonly minorUnits: number;
  readonly currency: CurrencyCode;

  private constructor(minorUnits: number, currency: CurrencyCode) {
    this.minorUnits = Math.round(minorUnits);
    this.currency = currency;
  }

  static fromMajor(amount: number, currency: CurrencyCode = "USD"): Money {
    const factor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
    return new Money(amount * factor, currency);
  }

  static fromMinor(minorUnits: number, currency: CurrencyCode = "USD"): Money {
    return new Money(minorUnits, currency);
  }

  static zero(currency: CurrencyCode = "USD"): Money {
    return new Money(0, currency);
  }

  private assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new Error(`Currency mismatch: cannot combine ${this.currency} with ${other.currency}`);
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits - other.minorUnits, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.minorUnits * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new Error("Division by zero in Money.divide");
    return new Money(this.minorUnits / divisor, this.currency);
  }

  negate(): Money {
    return new Money(-this.minorUnits, this.currency);
  }

  get isNegative(): boolean {
    return this.minorUnits < 0;
  }

  get isZero(): boolean {
    return this.minorUnits === 0;
  }

  get isPositive(): boolean {
    return this.minorUnits > 0;
  }

  toMajor(): number {
    const factor = ZERO_DECIMAL_CURRENCIES.has(this.currency) ? 1 : 100;
    return this.minorUnits / factor;
  }

  toMinor(): number {
    return this.minorUnits;
  }

  compareTo(other: Money): number {
    this.assertSameCurrency(other);
    return this.minorUnits - other.minorUnits;
  }

  greaterThan(other: Money): boolean {
    return this.compareTo(other) > 0;
  }

  lessThan(other: Money): boolean {
    return this.compareTo(other) < 0;
  }

  format(locale = "en-US"): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency: this.currency }).format(this.toMajor());
  }

  toJSON(): { minorUnits: number; currency: CurrencyCode } {
    return { minorUnits: this.minorUnits, currency: this.currency };
  }
}
