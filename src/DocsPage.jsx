const DocsPage = () =>{
    return(
        <div style ={{
            width: "100%",
            height: "100vh",
            background: "#efebeb"}}>
            <h1>Docs Page Loaded</h1>
            <iframe
                src="http://localhost:8000/documentation"
                width="100%"
                height="100%"
                title="BlockBuild Documentation"
                style={{ border: "none" }}
            />
         </div>
    )

}

export default DocsPage;