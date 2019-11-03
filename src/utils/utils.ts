export function getConfigFile (): string {
    //в аргументе указал какой файл конфигурации требуется загрузить
    let nodePath = process.argv[0];
    let appPath = process.argv[1];
    let filename = process.argv[2];
    console.log(`nodePath: ${nodePath}`);
    console.log(`appPath: ${appPath}`);
    console.log(`filename: ${filename}`);//
    return filename;
}