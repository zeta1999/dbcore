module Config

open System.Collections.Generic
open System.IO

open YamlDotNet.Serialization
open YamlDotNet.Serialization.NamingConventions


type DatabaseConfig() =
    // TODO: only postgres is supported
    member val Dialect = "postgres" with get, set
    member val Host = "localhost" with get, set
    member val Port = "5432" with get, set
    member val Database = "" with get, set
    member val Username = "" with get, set
    member val Password = "" with get, set
    member val Parameters = "" with get, set


[<AbstractClass>]
type ProjectConfig() =
    abstract OutDir : string with get, set
    abstract Template : string with get, set


type ApiConfig() =
    inherit ProjectConfig()

    let mutable outdir = ""
    override this.OutDir
        with get() = if outdir = "" then this.Template else ""
        and set(value) = outdir <- value


    override val Template = "go" with get, set
    member val Address = "" with get, set
    member val RouterPrefix = "" with get, set
    member val Extra = new Dictionary<string, string>() with get, set


type BrowserConfig() =
    inherit ProjectConfig()

    let mutable outdir = ""
    override this.OutDir
        with get() = if outdir = "" then this.Template else ""
        and set(value) = outdir <- value

    override val Template = "react-ts" with get, set

    member val Address = "" with get, set


type Config() =
    member val Database = DatabaseConfig() with get, set
    member val Api = ApiConfig() with get, set
    member val Browser = BrowserConfig() with get, set
    member val Project = "" with get, set


let GetConfig(f: string) : Config =
    let file = new FileStream(f, FileMode.Open, FileAccess.Read)
    let stream = new StreamReader(file)
    let deserializer = (new DeserializerBuilder()).WithNamingConvention(CamelCaseNamingConvention.Instance).Build()
    let config = deserializer.Deserialize<Config>(stream)
    stream.Close()

    // TODO: validate config
    config
