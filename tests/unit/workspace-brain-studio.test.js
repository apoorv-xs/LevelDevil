import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

describe("System 1 Brain Studio Admin Console Interface Contracts", () => {
  const workspaceHtmlPath = path.resolve(__dirname, "../../workspace/index.html");
  const workspaceAppPath = path.resolve(__dirname, "../../workspace/app.js");

  let htmlContent = "";
  let appJsContent = "";

  beforeEach(() => {
    htmlContent = fs.readFileSync(workspaceHtmlPath, "utf-8");
    appJsContent = fs.readFileSync(workspaceAppPath, "utf-8");
  });

  describe("HTML & DOM Architecture", () => {
    it("includes Brain Studio tab switcher button in admin modal header", () => {
      expect(htmlContent).toContain('id="btnAdminTabBrain"');
      expect(htmlContent).toContain("switchAdminTab('brain')");
      expect(htmlContent).toContain("Brain Studio");
    });

    it("includes adminTabBrain container with custom scrollbar", () => {
      expect(htmlContent).toContain('id="adminTabBrain"');
      expect(htmlContent).toContain("Cognitive Telemetry & Frame Budget");
    });

    it("includes cognitive telemetry monitor fields", () => {
      expect(htmlContent).toContain('id="telemetryIntentVal"');
      expect(htmlContent).toContain('id="telemetryThoughtVal"');
      expect(htmlContent).toContain('id="telemetryTotalNodesVal"');
      expect(htmlContent).toContain('id="telemetryCloudStatusVal"');
    });

    it("includes interactive neural training form and input controls", () => {
      expect(htmlContent).toContain('id="trainBrainForm"');
      expect(htmlContent).toContain('id="trainNodeId"');
      expect(htmlContent).toContain('id="trainCategory"');
      expect(htmlContent).toContain('id="trainPage"');
      expect(htmlContent).toContain('id="trainMatchKeywords"');
      expect(htmlContent).toContain('id="trainThoughtText"');
      expect(htmlContent).toContain('id="trainAction"');
      expect(htmlContent).toContain('id="trainAudioCue"');
      expect(htmlContent).toContain('id="trainJumpForce"');
    });

    it("includes neural knowledge explorer and category filter", () => {
      expect(htmlContent).toContain('id="brainKnowledgeList"');
      expect(htmlContent).toContain('id="brainSearchInput"');
      expect(htmlContent).toContain('id="brainCategoryFilter"');
      expect(htmlContent).toContain('id="brainExplorerCountBadge"');
    });

    it("includes Cloud Firestore and dataset management actions", () => {
      expect(htmlContent).toContain("pushBrainToFirestoreUI()");
      expect(htmlContent).toContain("syncBrainFromFirestoreUI()");
      expect(htmlContent).toContain("exportBrainDatasetUI()");
      expect(htmlContent).toContain('id="brainJsonFileInput"');
      expect(htmlContent).toContain("resetBrainToFactoryUI()");
    });

    it("loads system1_brain.js directly in workspace/index.html before app.js", () => {
      expect(htmlContent).toContain('<script src="/system1_brain.js?v=1014"></script>');
      const brainIndex = htmlContent.indexOf('src="/system1_brain.js?v=1014"');
      const appIndex = htmlContent.indexOf('src="app.js"');
      expect(brainIndex).toBeGreaterThan(-1);
      expect(appIndex).toBeGreaterThan(-1);
      expect(brainIndex).toBeLessThan(appIndex);
    });
  });

  describe("Workspace app.js Controller Methods", () => {
    it("handles brain tab switching in switchAdminTab", () => {
      expect(appJsContent).toContain("tab === 'brain'");
      expect(appJsContent).toContain("renderBrainStudio()");
    });

    it("exports all Brain Studio handlers to window and global scopes", () => {
      expect(appJsContent).toContain("renderBrainStudio");
      expect(appJsContent).toContain("renderBrainKnowledgeExplorer");
      expect(appJsContent).toContain("handleTrainBrainSubmit");
      expect(appJsContent).toContain("handleDeleteTrainedNode");
      expect(appJsContent).toContain("exportBrainDatasetUI");
      expect(appJsContent).toContain("importBrainDatasetUI");
      expect(appJsContent).toContain("resetBrainToFactoryUI");
      expect(appJsContent).toContain("pushBrainToFirestoreUI");
      expect(appJsContent).toContain("syncBrainFromFirestoreUI");
      expect(appJsContent).toContain("startBrainTelemetryPolling");
      expect(appJsContent).toContain("stopBrainTelemetryPolling");
    });
  });
});
