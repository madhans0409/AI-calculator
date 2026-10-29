import test from "node:test";
import assert from "node:assert/strict";
import { localAssistantReply } from "../src/services/assistant.js";

test("the built-in assistant auto-detects Tamil and responds in Tamil", () => {
  assert.match(localAssistantReply("வணக்கம்"), /வணக்கம்/);
});

test("the built-in assistant answers a Tamil currency question in Tamil", () => {
  assert.match(localAssistantReply("நாணய மாற்றம் எப்படி?", "ta"), /மாற்று விகிதம்/);
});

test("the built-in assistant answers a Tamil fitness question in Tamil", () => {
  assert.match(localAssistantReply("உடற்பயிற்சி எடை குறைப்பு", "ta"), /Fitness/);
});
