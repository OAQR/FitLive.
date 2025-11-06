module.exports = {
  
  // Entorno donde se ejecutará el código
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  
  // Extiende configuraciones recomendadas
  extends: [
    "eslint:recommended",
    "plugin:astro/recommended", // Reglas recomendadas para Astro
  ],
  
  // Parser para entender el código
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  
  // Plugins que estamos usando
  plugins: [],
  // Reglas personalizadas (podemos añadir más después)
  rules: {
    // Ejemplo: "no-unused-vars": "warn" // Advertir sobre variables no usadas
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      extends: ["plugin:@typescript-eslint/recommended"],
    }
  ],
};