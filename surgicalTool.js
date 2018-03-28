var rigidSurgicalTool = class {
    constructor() {
        console.log("   Creating the surgical tool class ...");

        //default tool values:
        this.length = 30; //mm

        // robot kinematics
        this.w_M_e = new THREE.Matrix4;

        this.e_M_t = new THREE.Matrix4;
        this.e_M_t.elements[8] = this.length;
        console.log( "   e_M_t = \n" + this.e_M_t.elements );
        
        this.w_M_t = new THREE.Matrix4;
        this.w_M_t.multiplyMatrices( this.w_M_e, this.e_M_t );
        console.log( "   w_M_t = \n" + this.w_M_t.elements );

        this.create3Dmodel(); 
        this.initToolCRF();
    }

    create3Dmodel() {
        console.log("   Creating the tool form ...");
        this.mesh = new THREE.Group();

        // create the sphere base
        var sphereRadius = 3;
        var sphereWidthSegments= 32;
        var sphereHeightSegments = 32;
        var sphereColor = 0x2194ce;
        var geomSphere = new THREE.SphereGeometry( sphereRadius, sphereWidthSegments, sphereHeightSegments );
        var matSphere = new THREE.MeshPhongMaterial( {color: sphereColor} );
        this.sphereBase = new THREE.Mesh( geomSphere, matSphere );
        this.sphereBase.matrixAutoUpdate = false;
        this.mesh.add( this.sphereBase );

        // create the tool body
        var cyclRadiusTop = 1;
        var cyclRadiusBottom = 1;
        var cyclHeight = this.length;
        var cyclRadialSegments = 32;
        var cyclColor = 0x2194ce;
        var geomCylinder = new THREE.CylinderGeometry( cyclRadiusTop, cyclRadiusBottom, cyclHeight, cyclRadialSegments );
        var matCylinder = new THREE.MeshPhongMaterial( {color: cyclColor} );
        var cylinderTool = new THREE.Mesh( geomCylinder, matCylinder );
        this.mesh.add( cylinderTool );

        this.mesh.matrixAutoUpdate = false;

        cylinderTool.position.y = this.length/2;
    }

    initToolCRF() {
        this.baseCRF = new THREE.AxisHelper( 10 );
        this.baseCRF.matrixAutoUpdate = false;
        this.baseCRF.visible = true;
        this.mesh.add( this.baseCRF );

        this.tipCRF = new THREE.AxisHelper( 10 );
        this.tipCRF.matrixAutoUpdate = false;
        this.tipCRF.visible = true;
        this.mesh.add( this.tipCRF );
        this.updateToolCRF();


        console.log( "initToolCRF: w_M_e = " + this.w_M_e.elements );
        var w_P_e = new THREE.Vector3;
        w_P_e.setFromMatrixPosition( this.w_M_e );
        var w_Q_e = new THREE.Quaternion;
        w_Q_e.setFromRotationMatrix( this.w_M_e );
        //var w_S_e = new THREE.Vector3;
        //this.w_M_e.decompose( w_P_e, w_Q_e, w_S_e );
        console.log( "initToolCRF: w_P_e = " + w_P_e.elements );
        console.log( "initToolCRF: w_Q_e = " + w_Q_e.elements );
    }

    updateToolCRF() {
        this.baseCRF.matrix.copy( this.w_M_e );
        this.tipCRF.matrix.copy( this.w_M_t );
        this.sphereBase.matrix.copy( this.w_M_e );
        //this.mesh.matrix.copy( this.w_M_e );
    }

    toggleDisplayToolCRF(){
        this.baseCRF.visible = ! this.baseCRF.visible;
        this.tipCRF.visible = ! this.tipCRF.visible;
    }

    updateAll() {
        //this.updateRobotKinematics();
        //this.update3Dmodel();
        this.updateToolCRF();

        //tranform m in px
        //this.mesh.scale.set(1000,1000,1000);
        this.mesh.updateMatrix();
    }

    setEndEffectorPose( w_pose_e ) {
        
        // var q = new THREE.Quaternion( w_pose_e[3], w_pose_e[4], w_pose_e[5], 1 );
        // var r = new THREE.Matrix4();
        var q = new THREE.Euler( w_pose_e[3], w_pose_e[4], w_pose_e[5], 'XYZ' );
        this.w_M_e.makeRotationFromEuler(q);
        //this.w_M_e.makeRotationFromQuaternion( q );
        this.w_M_e.setPosition( new THREE.Vector3(w_pose_e[0], w_pose_e[1], w_pose_e[2] ));

        /*var L1 = this.tubeLength[0] + q[3];        
        var L2 = this.tubeLength[1] + q[4] - L1;        
        var L3 = this.tubeLength[2] + q[5] - L2 - L1;        

        if (L1 >= 0 && L2 >= 0 && L3 >= 0){
            this.rho1   = q[3];
            this.rho2   = q[4];
            this.rho3   = q[5];
            return 'OK';
        } else {
            return 'ERROR';
        }*/
        return 'OK';
    }
    
    getEndEffectorPose() {
        var w_P_e = new THREE.Vector3;
        var w_Q_e = new THREE.Quaternion;
        var w_S_e = new THREE.Vector3;
        this.w_M_e.decompose( w_P_e, w_Q_e, w_S_e );
        //console.log( "getEndEffectorPose: w_P_e = " + w_P_e.elements );
        //return [w_P_e, w_Q_e];
        
        var w_pose_e = new Array(6);
        w_pose_e[0] = w_P_e.x;
        w_pose_e[1] = w_P_e.y;
        w_pose_e[2] = w_P_e.z;
        w_pose_e[3] = w_Q_e._x;
        w_pose_e[4] = w_Q_e._y;
        w_pose_e[5] = w_Q_e._z;
        //console.log(w_pose_e);
        //console.log( "getEndEffectorPose: w_pose_e = " + w_pose_e.elements );
        return w_pose_e;
    }

    getEndEffectorHomogTransform(){
        return this.w_M_e;
    }
}