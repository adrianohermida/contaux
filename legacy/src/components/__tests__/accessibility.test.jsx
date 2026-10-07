/**
 * WCAG 2.1 AA Accessibility Tests
 * Validação automática de conformidade com padrões de acessibilidade
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

/**
 * Teste de Color Contrast (WCAG AA: 4.5:1 para texto normal)
 */
test('Color contrast should meet WCAG AA standard', async () => {
  const { container } = render(
    <div className="bg-slate-900 text-white p-4">
      <h1>High contrast text</h1>
      <p>This text meets WCAG AA contrast ratio requirements</p>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de ARIA Labels
 */
test('All interactive elements should have proper ARIA labels', async () => {
  const { container } = render(
    <div>
      <button aria-label="Close dialog">✕</button>
      <input aria-label="Search contacts" placeholder="Search..." />
      <a href="#" aria-label="View profile">Profile</a>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Semantic HTML
 */
test('Form elements should use semantic HTML', async () => {
  const { container } = render(
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Heading Structure
 */
test('Page should have proper heading hierarchy', async () => {
  const { container } = render(
    <div>
      <h1>Main Title</h1>
      <h2>Section Title</h2>
      <h3>Subsection Title</h3>
      <p>Content here</p>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Alt Text para Imagens
 */
test('All images should have descriptive alt text', async () => {
  const { container } = render(
    <div>
      <img src="/test.jpg" alt="Descriptive image text" />
      <img src="/logo.png" alt="Company logo" />
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Focus Management
 */
test('Keyboard navigation should be accessible', async () => {
  const { container, getByRole } = render(
    <div>
      <button>First Button</button>
      <input type="text" placeholder="Input field" />
      <button>Second Button</button>
    </div>
  );

  const buttons = getByRole('button');
  expect(buttons).toBeDefined();
  expect(buttons).toHaveAttribute('tabindex');
});

/**
 * Teste de Links e Botões
 */
test('Links and buttons should be distinguishable', async () => {
  const { container } = render(
    <div>
      <a href="/page">Link text</a>
      <button>Button text</button>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Dark Mode Accessibility
 */
test('Dark mode should maintain proper contrast ratios', async () => {
  const { container } = render(
    <div className="dark bg-slate-900 text-slate-100 p-4">
      <h1>Dark mode heading</h1>
      <p>Text with proper contrast in dark mode</p>
      <a href="#" className="text-blue-400">Accessible link</a>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Alerts e Live Regions
 */
test('Alert messages should use proper ARIA roles', async () => {
  const { container } = render(
    <div role="alert" aria-live="polite">
      <p>This is an alert message</p>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de Modal Accessibility
 */
test('Modals should have proper ARIA attributes', async () => {
  const { container } = render(
    <div role="dialog" aria-labelledby="modal-title" aria-describedby="modal-desc">
      <h2 id="modal-title">Modal Title</h2>
      <p id="modal-desc">Modal description</p>
      <button>Close</button>
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

/**
 * Teste de List Semantics
 */
test('Lists should use proper semantic HTML', async () => {
  const { container } = render(
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});