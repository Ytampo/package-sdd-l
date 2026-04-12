function formatSection(part, index) {
  const title = `## ${index + 1}. ${part.kind.toUpperCase()} (${part.relativePath})`;
  return `${title}\n\n${part.content.trim()}\n`;
}

export function buildInstruction({ role, runtime, parts, generatedAt = new Date() }) {
  const lines = [
    "# SDD-L Generated Instruction",
    "",
    `- role: ${role}`,
    `- runtime: ${runtime}`,
    `- generated_at: ${generatedAt.toISOString()}`,
    "",
    "---",
    "",
  ];

  const sections = parts.map((part, index) => formatSection(part, index)).join("\n---\n\n");

  return `${lines.join("\n")}${sections}`;
}
