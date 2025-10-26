module.exports = {

  semi: true, // Poner punto y coma al final de las líneas
  singleQuote: false, // Usar comillas dobles para strings
  tabWidth: 4, // Usar 4 espacios por tabulación
  trailingComma: "es5", // Poner comas finales en arrays y objetos
  
  // Plugin para Astro
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};