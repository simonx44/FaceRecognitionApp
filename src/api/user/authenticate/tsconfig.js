export default {
  compilerOptions: {
    target: "es2020",
    strict: true,
    preserveConstEnums: true,
    noEmit: true,
    sourceMap: false,
    module: "es2015",
    moduleResolution: "node",
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    plugins: [importPathPlugin],
    external: ["../../../core/RecognitionService"],
  },
  exclude: ["node_modules", "**/*.test.ts"],
};
