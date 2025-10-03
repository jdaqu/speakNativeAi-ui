import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Custom rules for card component consistency
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name="Card"] JSXAttribute[name.name="className"][value.value*="p-"], JSXElement[openingElement.name.name="Card"] JSXAttribute[name.name="className"][value.value*="px-"], JSXElement[openingElement.name.name="Card"] JSXAttribute[name.name="className"][value.value*="py-"]',
          message: 'Avoid custom padding on Card components. Use Card presets (FormCard, SectionCard, etc.) or the Card padding prop instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="CardHeader"] JSXAttribute[name.name="className"][value.value*="p-"], JSXElement[openingElement.name.name="CardHeader"] JSXAttribute[name.name="className"][value.value*="px-"], JSXElement[openingElement.name.name="CardHeader"] JSXAttribute[name.name="className"][value.value*="py-"]',
          message: 'Avoid custom padding on CardHeader. Use the padding prop or Card presets instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="CardContent"] JSXAttribute[name.name="className"][value.value*="p-"], JSXElement[openingElement.name.name="CardContent"] JSXAttribute[name.name="className"][value.value*="px-"], JSXElement[openingElement.name.name="CardContent"] JSXAttribute[name.name="className"][value.value*="py-"]',
          message: 'Avoid custom padding on CardContent. Use the padding prop or Card presets instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="CardFooter"] JSXAttribute[name.name="className"][value.value*="p-"], JSXElement[openingElement.name.name="CardFooter"] JSXAttribute[name.name="className"][value.value*="px-"], JSXElement[openingElement.name.name="CardFooter"] JSXAttribute[name.name="className"][value.value*="py-"]',
          message: 'Avoid custom padding on CardFooter. Use the padding prop or Card presets instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="Card"] TemplateElement[value.raw*="p-"], JSXElement[openingElement.name.name="Card"] TemplateElement[value.raw*="px-"], JSXElement[openingElement.name.name="Card"] TemplateElement[value.raw*="py-"]',
          message: 'Avoid custom padding in template literals on Card components. Use Card presets or the padding prop instead.'
        }
      ]
    }
  },
];

export default eslintConfig;
