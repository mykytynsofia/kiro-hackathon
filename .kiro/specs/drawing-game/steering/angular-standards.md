---
description: "Modern Angular (v17+) Best Practices, Signals, and Standalone Components standards."
fileMatch:
  - "**/*.ts"
  - "**/*.html"
  - "**/*.scss"
---

# Angular Best Practices

## Component Architecture
* **Use Standalone Components:** Eliminate `NgModule` boilerplate. Declare components, directives, and pipes as `standalone: true`.
* **Adhere to Single Responsibility:** Separate "Smart" (Container) components that handle data fetching/logic from "Dumb" (Presentational) components that purely render UI based on inputs.
* **Strict TypeScript Implementation:** Enable strict mode in `tsconfig.json` and use strict typing for all properties and return types.
* **Barrel Files for Exports:** Use `index.ts` files to group related exports and keep import paths clean.

## Reactivity (Signals & RxJS)
* **Prefer Signals for Synchronous State:** Use `signal()`, `computed()`, and `effect()` for local state and derived values instead of relying solely on `NgZone` or manual subscription management.
* **Use RxJS for Asynchronous Events:** Reserve Observables for complex event streams, HTTP requests, and debouncing.
* **Declarative Subscription Handling:** Use the `AsyncPipe` (or `.value` in Signals) in templates to automatically manage subscriptions and prevent memory leaks.
* **DestroyRef:** Use `DestroyRef` for logic cleanup instead of implementing `ngOnDestroy` in every class.

## Inputs and State Management
* **Required and Transform Inputs:** Use `@Input({ required: true })` and input transforms (e.g., `booleanAttribute`) to enforce type safety and clean up parsing logic.
* **Injectable Services:** Use `providedIn: 'root'` for singleton services to manage global state.
* **Immutability:** Treat data as immutable; when updating Signals or BehaviorSubjects, emit new object references rather than mutating existing properties.
* **Dependency Injection:** Inject dependencies via the `inject()` function for better type inference and cleaner constructors.

## Performance
* **OnPush Change Detection:** Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components to minimize unnecessary rendering cycles.
* **Modern Control Flow:** Use the built-in control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`) for better rendering performance.
* **Track By in Loops:** Always provide a tracking expression in `@for` loops (e.g., `@for (item of items; track item.id)`) to optimize DOM updates.
* **Defer Loading:** Use `@defer` blocks to lazily load non-critical parts of the template.

## Styling
* **View Encapsulation:** Rely on Angular's default Emulated View Encapsulation to scope styles to components automatically.
* **SCSS/SASS:** Use SCSS for nesting and mixins.
* **Host Selectors:** Use `:host` to style the component element itself rather than wrapping the template in a redundant `div`.
* **Avoid Deep Selectors:** Avoid `::ng-deep` as it breaks encapsulation; use global styles or shared classes instead.

## Testing
* **Test Behavior:** Focus on testing the public API (inputs/outputs) and DOM result rather than private class methods.
* **Angular Testing Library:** Consider using Angular Testing Library over the default `TestBed` for more user-centric tests.
* **Mock Dependencies:** Use strictly typed mocks for services and child components to isolate the unit under test.
* **No Logic in Templates:** Keep templates declarative to ensure logic is testable within the component class or signals.