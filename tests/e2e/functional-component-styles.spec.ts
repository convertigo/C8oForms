import { test } from "./fixtures";
import { verifyApplicationToButtonBorderInheritanceThroughUi } from "./helpers/functional-component-styles";
import {
  createBlankApplicationThroughUi,
  loginWithUsernamePassword,
} from "./helpers/functional-studio";

test.describe("No-Code Studio functional component style contract", () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  /**
   * #1411 introduced the visual box-style editor in 12e76ac4 (beta242).
   * The Button follow-up briefly targeted its inner component and translated
   * border values to Ionic variables, while the visible outer card still had
   * a 1px product border. Commit 3959b1aa (first shipped in beta249) made the
   * Button target the container and removed that special mapping; QA
   * historically validated the final behavior in beta253.
   *
   * PARTIAL epic scope: this owner protects the application -> Button
   * inheritance, component override, reset, and finalized Button border
   * default/removal contract. Page, layout/group-child, per-side border, and
   * style-provenance indicator contracts remain outside this scenario.
   * Runtime validation of this functional owner on current test-nocode is
   * pending; the fixture is authored exclusively through the Studio UI.
   */
  test("CMP-STYLE-001 #1411 - inherit override and reset a Button container border", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await loginWithUsernamePassword(page);
    const applicationId = await createBlankApplicationThroughUi(page);
    await verifyApplicationToButtonBorderInheritanceThroughUi(
      page,
      applicationId,
    );
  });
});
