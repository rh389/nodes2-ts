import {S2CellId} from "../src/S2CellId";
import {expect} from "chai";
const genLocs = require('./generated-locations.json');
const genJavaLocs = require('./java-gen-locations.json');
import Decimal = require('decimal.js');
import Long = require('long');
import {S2Point} from "../src/S2Point";
import {R2Vector} from "../src/S2Vector";
import {S2LatLngRect} from "../src/S2LatLngRect";
import {S1Angle} from "../src/S1Angle";
import {MutableInteger} from "../src/MutableInteger";
describe('S2CellId', () => {
  describe('java data', () => {
    describe('decoding', () => {
      it('should decode fromFacePosLevel', () => {
        genJavaLocs
            .forEach(item => {

              const pos = Long.fromString(item.pos, true, 10);
              const s2CellId = S2CellId.fromFacePosLevel(item.face, pos, item.lvl);
              expect(s2CellId.id.toString()).to.be.equal(item.id);
            });
      });
      it('should decode from token', () => {
        genJavaLocs
            .forEach(item => {
              const s2CellId = S2CellId.fromToken(item.token);
              expect(s2CellId.id.toString()).to.be.equal(item.id);

            })
      });
      it('should decode from Face Ij', () => {
        genJavaLocs
            .forEach(item => {
              const s2CellId = S2CellId.fromFaceIJ(item.face, parseInt(item.i), parseInt(item.j))
                  .parentL(item.lvl);
              expect(s2CellId.id.toString()).to.be.equal(item.id);
            });
      });
      it('should decode from point', () => {
        genJavaLocs
            .forEach(item => {
              const s2Point = new S2Point(item.point.x, item.point.y, item.point.z);
              const s2CellId = S2CellId.fromPoint(s2Point)
                  .parentL(item.lvl);
              expect(s2CellId.id.toString()).to.be.equal(item.id);
            })
      })
    });
    describe('instance data', () => {
      let items = [];
      before(() => {
        items = genJavaLocs.map(item => {
          return {
            item,
            cell: S2CellId.fromToken(item.token)
          }
        });
        items.forEach(i => {
          expect(i.item.id).to.be.eq(i.cell.id.toString())
        })
      });
      it('token should match', () => {
        items.forEach(i => {
          expect(i.cell.toToken()).to.be.eq(i.item.token);
        });
      });
      it('bau', () => {
        items.forEach(i => {
          expect(
              R2Vector.singleStTOUV(i.item.s).minus(i.item.u).abs().toNumber()
          )
              .to.be.lt(1e-15);

          expect(
              R2Vector.singleStTOUV(i.item.t).minus(i.item.v).abs().toNumber(),
              't to v '
          ).to.be.lt(1e-15);

          expect(
              R2Vector.singleUVToST(i.item.u).minus(i.item.s).abs().toNumber()
          ).to.be.lt(1e-15);

          expect(
              R2Vector.singleUVToST(i.item.v).minus(i.item.t).abs().toNumber()
          ).to.be.lt(1e-15);

          expect(R2Vector.singleUVToST(R2Vector.singleStTOUV(i.item.s)).toFixed(15))
              .to.be.eq(new Decimal(i.item.s).toFixed(15));
          expect(R2Vector.singleUVToST(R2Vector.singleStTOUV(i.item.t)).toFixed(15))
              .to.be.eq(new Decimal(i.item.t).toFixed(15));
        });
      })
      it('toPoint should match', () => {
        items.forEach(i => {
          expect(
              i.cell.toPoint().aequal(new S2Point(i.item.point.x, i.item.point.y, i.item.point.z), 1e-15),
              `a${i.cell.toPoint().toString()} - ${i.item.point.x},${i.item.point.y},${i.item.point.z}`
          ).is.true;
        });
      });
      it('.next should match', () => {
        items.forEach(i => {
          expect(i.cell.next().id.toString())
              .to.be.eq(i.item.next)
        });
      });
      it('.prev should match', () => {
        items.forEach(i => {
          expect(i.cell.prev().id.toString())
              .to.be.eq(i.item.prev);
        })
      });
      it('.level should match', () => {
        items.forEach(i => {
          expect(i.cell.level())
              .to.be.eq(i.item.lvl)
        })
      });
      it('.toLatLng should match', () => {
        items.forEach(i => {
          // Latitude
          expect(i.cell.toLatLng().latRadians.toFixed(14))
              .to.be.eq(
                  S1Angle.degrees(
                      i.item.cellCoords.lat
                  ).radians.toFixed(14)
          );
          // Longitude
          expect(i.cell.toLatLng().lngRadians.toFixed(13))
              .to.be.eq(
              S1Angle.degrees(
                  i.item.cellCoords.lng
              ).radians.toFixed(13)
          );
        });
      });
      it('.parent shouold match', () => {
        items.forEach(i => {
          expect(i.cell.parent().id.toString())
              .to.be.eq(i.item.parent)
        })
      });
      it('.parentL(1) shouold match', () => {
        items.forEach(i => {
          expect(i.cell.parentL(1).id.toString())
              .to.be.eq(i.item.parentLvl1)
        })
      });
      it('.rangeMin should match', () => {
        items.forEach(i => {
          expect(i.cell.rangeMin().id.toString())
              .to.be.eq(i.item.rangeMin);
        })
      });
      it('.rangeMax should match', () => {
        items.forEach(i => {
          expect(i.cell.rangeMax().id.toString())
              .to.be.eq(i.item.rangeMax);
        })
      });

      it('.face should match', () => {
        items.forEach(i => {
          expect(i.cell.face)
              .to.be.eq(i.item.face);
        })
      });
      it('.toFaceIJOrientation should create correct i,j values', () => {
        items.forEach(i => {
          const mi= new MutableInteger(0),mj=new MutableInteger(0);
          const face = i.cell.toFaceIJOrientation(mi, mj, null);
          expect(face).to.be.eq(i.cell.face);
          expect(mi.val).to.be.eq(i.item.i);
          expect(mj.val).to.be.eq(i.item.j);
        })
      });
      it('.getEdgeNeighbors should match', () => {
        items.forEach(i => {
          const edgeIDs = i.cell.getEdgeNeighbors().map(cellId => cellId.id.toString());
          expect(edgeIDs)
              .to.be.deep.eq(i.item.neighbors);


        });
      });
      it('.pos should match', () => {
        items.forEach(i => {
          expect(i.cell.pos().toString()).to.be.eq(i.item.pos);
        });
      });

      it('.getAllNeighbors should match', () => {
        items.forEach(i => {
          const edgeIDs = i.cell.getAllNeighbors(i.cell.level()+1).map(cellId => cellId.id.toString());
          expect(edgeIDs)
              .to.be.deep.eq(i.item.allNeighborsLvlP1);
        });
      });
      it('.contains should work with direct parent', () => {
        items.forEach(i => {
          expect(i.cell.parent().contains(i.cell)).is.true;
        });
      });

    });
  });

});