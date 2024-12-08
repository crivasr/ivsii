// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente. IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar: 
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento.
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.  
// <=====================================================================================================>


// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es 
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla. 

function GetModelMatrix(rotationX, rotationY) {
	var cosX = Math.cos(rotationX); 
	var sinX = Math.sin(rotationX);

	var cosY = Math.cos(rotationY); 
	var sinY = Math.sin(rotationY);

	var Rx = [
		1, 0, 0, 0,
		0, cosX, -sinX, 0,
		0, sinX, cosX, 0,
		0, 0, 0, 1
	];

	var Ry = [
		cosY, 0, sinY, 0,
		0, 1, 0, 0,
		-sinY, 0, cosY, 0,
		0, 0, 0, 1
	];

	return MatrixMult( Rx, Ry );
}

function GetViewMatrix(translationX, translationY, translationZ) {
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	]

	return trans;
}

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	var model = GetModelMatrix(rotationX, rotationY);
	var view = GetViewMatrix(translationX, translationY, translationZ);
	
	var mv = MatrixMult( view, model );
	var mvp = MatrixMult( projectionMatrix, mv );

	return mvp;
}


// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram( meshVS, meshFS );

		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp               = gl.getUniformLocation( this.prog, 'mvp' );
		this.model             = gl.getUniformLocation( this.prog, 'model' );
		this.shouldSwapZY      = gl.getUniformLocation( this.prog, 'shouldSwapZY' );
		this.shouldShowTexture = gl.getUniformLocation( this.prog, 'shouldShowTexture' );
		this.lightPosition     = gl.getUniformLocation( this.prog, 'lightPosition' );
        this.lightColor        = gl.getUniformLocation( this.prog, 'lightColor' );
        this.ambientColor      = gl.getUniformLocation( this.prog, 'ambientColor' );
        this.viewPos           = gl.getUniformLocation( this.prog, 'viewPos' );

		this.tex = gl.createTexture();
		
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.vertPos    = gl.getAttribLocation( this.prog, 'pos' );
		this.texCoords  = gl.getAttribLocation( this.prog, 'tex' );
		this.normal     = gl.getAttribLocation( this.prog, 'normal' );

		// 4. Creamos el buffer para los vertices
		this.vertBuffer   = gl.createBuffer();
		this.texBuffer    = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
	}
	
    setLightColor( color ) {
        gl.useProgram( this.prog );
        gl.uniform3fv( this.lightColor, color );
    }

    setAmbientColor( color ) {
        gl.useProgram( this.prog );
        gl.uniform3fv( this.ambientColor, color );
    }

	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float. 
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las coordenadas de textura se componen de a 2 elementos consecutivos y se 
	// asocian a cada vértice en orden. 
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices
		this.numTriangles = vertPos.length / 3 / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		gl.useProgram( this.prog );
		gl.uniform1i( this.shouldSwapZY, swap );
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw( mvp, model, lightPosition, viewPos )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );

		// 2. Setear matriz de transformacion
		gl.uniformMatrix4fv( this.mvp, false, mvp );
		gl.uniformMatrix4fv( this.model, false, model );
		gl.uniform3fv( this.lightPosition, lightPosition );
        gl.uniform3fv( this.viewPos, viewPos );

	    // 3.Binding de los buffers
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );

		// 4. Habilitamos los atributos
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
		gl.vertexAttribPointer( this.texCoords, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( this.texCoords );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.vertexAttribPointer( this.normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( this.normal );
		
		// Dibujamos
		
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura
		gl.useProgram( this.prog );
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader
		gl.useProgram( this.prog );
		gl.uniform1i( this.shouldShowTexture, show );
	}
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var meshVS = `
	attribute vec3 pos;
	attribute vec2 tex;
	attribute vec3 normal;
	
	varying vec2 TexCoords;
	varying vec3 Normal;
    varying vec3 FragPos;

	uniform mat4 mvp;
	uniform mat4 model;
	uniform bool shouldSwapZY;

	void main()
	{
		vec3 swapedPos = shouldSwapZY ? pos.xzy : pos;
		vec3 swapedNormal = shouldSwapZY ? normal.xzy : normal;

		TexCoords = tex;
		Normal    = normalize(mat3(model) * swapedNormal);
        FragPos   = vec3(model * vec4(swapedPos, 1));

		gl_Position = mvp * vec4(swapedPos,1);
	}
`;

// Fragment Shader
var meshFS = `
    precision mediump float;

    varying vec2 TexCoords;
	varying vec3 Normal;
    varying vec3 FragPos;

    uniform sampler2D tex;

    uniform bool shouldShowTexture;
    uniform vec3 lightPosition;
    uniform vec3 lightColor;
    uniform vec3 ambientColor;
    uniform vec3 viewPos;

    void main()
    {		
        if (shouldShowTexture) {
		    vec4 albedo = texture2D(tex, TexCoords);
			if (albedo.a < 0.1) discard;

            vec3 ambient = 0.17 * ambientColor;
            
            vec3 lightDir = normalize(lightPosition - FragPos);

            float diff = max(dot(Normal, lightDir), 0.0);
            vec3 diffuse = diff * lightColor;

            vec3 viewDir = normalize(viewPos - FragPos);
			vec3 halfwayDir = normalize(lightDir + viewDir);
            
            float specularStrength = 0.5;
            float shininess = 32.0;
            float spec = pow(max(dot(halfwayDir, Normal), 0.0), shininess);
            vec3 specular = specularStrength * spec * lightColor;

            vec3 color = (ambient + diffuse + specular) * albedo.rgb;
            gl_FragColor = vec4(color, albedo.a);
        } else {
            gl_FragColor = vec4(Normal,1);
        }
    }
`;
