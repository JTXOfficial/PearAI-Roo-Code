import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"
import { ModeConfig, getAllModesWithPrompts } from "../../../shared/modes"

export async function getModesSection(context: vscode.ExtensionContext): Promise<string> {
	const settingsDir = path.join(context.globalStorageUri.fsPath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })
	const customModesPath = path.join(settingsDir, "cline_custom_modes.json")

	// Get all modes with their overrides from extension state
	const allModes = await getAllModesWithPrompts(context)

	return `====

MODES

- These are the currently available modes:
${allModes.map((mode: ModeConfig) => `  * "${mode.name}" mode (${mode.slug}) - ${mode.roleDefinition.split(".")[0]}`).join("\n")}

- Custom modes can be configured in two ways:
  1. Globally via '${customModesPath}' (created automatically on startup)
  2. Per-workspace via '.roomodes' in the workspace root directory

  When modes with the same slug exist in both files, the workspace-specific .roomodes version takes precedence. This allows projects to override global modes or define project-specific modes.

  If asked to create a project mode, create it in .roomodes in the workspace root. If asked to create a global mode, use the global custom modes file.

- The following fields are required and must not be empty:
  * slug: A valid slug (lowercase letters, numbers, and hyphens). Must be unique, and shorter is better.
  * name: The display name for the mode
  * roleDefinition: A detailed description of the mode's role and capabilities
  * groups: Array of allowed tool groups (can be empty). Each group can be specified either as a string (e.g., "edit" to allow editing any file) or with file restrictions (e.g., ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }] to only allow editing markdown files)

- The customInstructions field is optional.

- For multi-line text, include newline characters in the string like "This is the first line.\\nThis is the next line.\\n\\nThis is a double line break."

Both files should follow this structure:
{
 "customModes": [
   {
     "slug": "designer", // Required: unique slug with lowercase letters, numbers, and hyphens
     "name": "Designer", // Required: mode display name
     "roleDefinition": "You are PearAI Agent (Powered by Roo Code / Cline), a UI/UX expert specializing in design systems and frontend development. Your expertise includes:\\n- Creating and maintaining design systems\\n- Implementing responsive and accessible web interfaces\\n- Working with CSS, HTML, and modern frontend frameworks\\n- Ensuring consistent user experiences across platforms", // Required: non-empty
     "groups": [ // Required: array of tool groups (can be empty)
       "read",    // Read files group (read_file, search_files, list_files, list_code_definition_names)
       "edit",    // Edit files group (apply_diff, write_to_file) - allows editing any file
       // Or with file restrictions:
       // ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }],  // Edit group that only allows editing markdown files
       "browser", // Browser group (browser_action)
       "command", // Command group (execute_command)
       "mcp"     // MCP group (use_mcp_tool, access_mcp_resource)
     ],
     "customInstructions": "Additional instructions for the Designer mode" // Optional
    }
  ]
}`
}
