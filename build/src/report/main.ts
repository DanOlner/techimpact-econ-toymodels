import "./style.css";
import { startStage1 } from "./stage1";
import { startStage2 } from "./stage2/page";

// One source, one page per stage: the site build sets the stage, and a completed stage's page is
// frozen in docs/<stage>/.
if (__SITE_STAGE__ === "stage-1") startStage1();
else startStage2();
