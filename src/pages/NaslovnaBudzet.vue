<template>
  <q-item class="top-bar">
    <h4 class="text-white">Kućni budžet</h4>
    <q-btn align="left" flat icon="code" size="xl" color="white">
      <q-tooltip style="font-size: 15px">
        Kod: {{ state.id_budzeta }}
      </q-tooltip>
    </q-btn>
    <div class="absolute-center" style="font-size: 20px; color: white">
      {{ state.naziv }}
    </div>
    <q-btn
      flat
      size="lg"
      color="white"
      class="absolute-right"
      icon="logout"
      @click="odjava"
    >
      <q-tooltip style="font-size: 15px">Odjava</q-tooltip>
    </q-btn>
  </q-item>
  <q-page
    class="full-width wrap justify-center items-center"
    style="background-color: #eeeeee"
  >
    <div class="header row">
      <div style="font-size: 20px; color: white" class="absolute-left">
        <q-icon name="person" color="white" size="40px"></q-icon>
        {{ state.ime }}
      </div>
      <div class="col-6 flex justify-center items-center">
        <BudgetHeader
          :izabraniMjesec="state.izabraniMjesec"
          :izabranaGodina="state.izabranaGodina"
          :trenutniBudzet="state.trenutniBudzet"
          :uneseniTroskovi="state.uneseniTroskovi"
          @promjenaMjesec="promjenaMjesec"
          @promjenaGodina="promjenaGodina"
        ></BudgetHeader>
      </div>
      <!-- zanimljivo -->
      <div
        id="chart"
        class="col-6 flex justify-center items-center"
        style="background-color: #393e46"
      >
        <apexchart
          type="pie"
          width="450"
          :options="state.chartOptions"
          :series="state.series"
        ></apexchart>
      </div>
    </div>
    <div
      class="col-12 flex justify-end"
      style="margin-top: -20px; margin-right: 60px"
    >
      <div>
        <q-btn
          label="DODAJ STAVKU"
          color="primary"
          icon="add"
          @click="dodajStavke"
        />
      </div>
    </div>
    <div
      class="row q-col-gutter-md"
      style="width: 100%; padding: 0px 40px 20px 40px"
    >
      <div class="col-4">
        <h5>Plan:</h5>
        <ListaUnosaPlana
          :uneseniPlan="state.uneseniPlan"
          :kategorije="state.kategorije"
          :trosakPoKategoriji="state.trosakPoKategoriji"
          @edit="editPlana"
        ></ListaUnosaPlana>
        <div v-if="state.uneseniPlan === null">
          <q-btn
            label="DODAJ PLAN"
            color="primary"
            icon="add"
            @click="dodajPlan"
          />
        </div>
      </div>
      <div class="col-4">
        <h5>Prihodi:</h5>
        <ListaUnosa
          :uneseniIznosi="state.uneseniPrihodi"
          :kategorije="state.kategorije"
          @edit="editStavke"
        ></ListaUnosa>
      </div>
      <div class="col-4">
        <h5>Troškovi:</h5>
        <ListaUnosa
          :uneseniIznosi="state.uneseniTroskovi"
          :kategorije="state.kategorije"
          @edit="editStavke"
        ></ListaUnosa>
      </div>
    </div>
  </q-page>
  <UnosStavke
    @zatvori="zatvoriUnos"
    :open="state.openStavke"
    :mjesec="state.izabraniMjesec"
    :godina="state.izabranaGodina"
    :id_budzeta="state.id_budzeta"
    :editStavka="state.editStavka"
    :kategorije="state.kategorije"
  ></UnosStavke>
  <UnosPlana
    @zatvori="zatvoriUnos"
    :open="state.openPlan"
    :mjesec="state.izabraniMjesec"
    :godina="state.izabranaGodina"
    :id_budzeta="state.id_budzeta"
    :editPlana="state.editPlana"
    :kategorije="state.kategorije"
  ></UnosPlana>
</template>

<script>
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "@firebase/firestore";
import { auth, db } from "src/boot/firebase";
import BudgetHeader from "src/components/BudzetHeader.vue";
import ListaUnosa from "src/components/ListaUnosa.vue";
import ListaUnosaPlana from "src/components/ListaUnosaPlana.vue";
import UnosStavke from "src/components/UnosStavke.vue";
import UnosPlana from "src/components/UnosPlana.vue";
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { signOut } from "@firebase/auth";
import { useRouter } from "vue-router";

const trenutniMjesec = new Date().getMonth() + 1;
const trenutnaGodina = new Date().getFullYear();

export default defineComponent({
  name: "NaslovnaBudzet",
  components: {
    BudgetHeader,
    ListaUnosa,
    ListaUnosaPlana,
    UnosStavke,
    UnosPlana,
    apexchart: VueApexCharts,
  },
  setup() {
    const state = reactive({
      openPlan: false,
      openStavke: false,
      editStavka: null,
      editPlana: null,
      izabraniMjesec: trenutniMjesec,
      izabranaGodina: trenutnaGodina,
      uneseniTroskovi: [],
      uneseniPrihodi: [],
      uneseniPlan: null,
      id_budzeta: null,
      ime: "",
      naziv: "",
      trenutniBudzet: 0,
      kategorije: [],
      chartOptions: {},
      series: [],
      trosakPoKategoriji: {},
    });

    const router = useRouter();

    const zatvoriUnos = () => {
      state.openStavke = false;
      state.openPlan = false;
      state.editPlana = null;
      state.editStavka = null;
    };

    let unsubscribe;

    const dohvatiIdBudzeta = async () => {
      let id_korisnika = auth.currentUser.uid;
      const korisnikRef = doc(db, "korisnik", id_korisnika);
      const docSnap = await getDoc(korisnikRef);
      state.id_budzeta = docSnap.data().id_budzeta;
      state.ime = docSnap.data().ime;
      dohvatiStavke();
      dohvatiPlan();
      dohvatiNazivBudzeta();
    };

    const dohvatiNazivBudzeta = async () => {
      const docRef = doc(db, "budzet", state.id_budzeta);
      const docSnap = await getDoc(docRef);
      state.naziv = docSnap.data().naziv;
    };

    const dohvatiStavke = async () => {
      const q = query(
        collection(db, "stavka"),
        where("id_budzeta", "==", state.id_budzeta),
        where("datum", "==", state.izabraniMjesec + "/" + state.izabranaGodina)
      );
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        state.trenutniBudzet = 0;
        state.trosakPoKategoriji = {};
        let prihodi = [];
        let troskovi = [];
        querySnapshot.forEach((doc) => {
          let stavka = {
            id: doc.id,
            iznos: doc.data().iznos ?? 0,
            opis: doc.data().opis,
            kategorija: state.kategorije.find(
              (kat) => kat.id === doc.data().id_kategorije
            ),
          };
          state.trenutniBudzet = state.trenutniBudzet + Number(stavka.iznos);
          if (Number(stavka.iznos) > 0) {
            prihodi.push(stavka);
          } else {
            troskovi.push(stavka);
            troskoviPoKategoriji(
              doc.data().id_kategorije,
              Math.abs(stavka.iznos)
            );
          }
        });
        state.uneseniPrihodi = prihodi;
        state.uneseniTroskovi = troskovi;
        pripremiPodatkeZaChart(troskovi);
      });
    };

    const troskoviPoKategoriji = (id_kat, iznos) => {
      if (state.trosakPoKategoriji[id_kat]) {
        let noviIznos = state.trosakPoKategoriji[id_kat] + iznos;
        state.trosakPoKategoriji[id_kat] = noviIznos;
      } else {
        state.trosakPoKategoriji[id_kat] = iznos;
      }
    };

    const pripremiPodatkeZaChart = (lista) => {
      let troskovi = [];
      let labels = [];
      if (lista.length > 0) {
        lista.map((item) => {
          if (!labels.includes(item?.kategorija?.naziv)) {
            labels.push(item?.kategorija?.naziv);
            troskovi.push(Number(item.iznos.slice(1)));
          } else {
            troskovi[labels.indexOf(item?.kategorija?.naziv)] += Number(
              String(item.iznos).slice(1)
            );
          }
        });
      }
      state.series = troskovi;
      state.chartOptions = { labels };
    };
    const dodajPlan = () => {
      state.openPlan = true;
    };
    const dohvatiPlan = async () => {
      const q = query(
        collection(db, "plan"),
        where("id_budzeta", "==", state.id_budzeta),
        where("datum", "==", state.izabraniMjesec + "/" + state.izabranaGodina)
      );//zanimljivo
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        state.uneseniPlan = null;
        let plan;
        querySnapshot.forEach((doc) => {
          plan = {
            id: doc.id,
            ukupno: doc.data().ukupno ?? 0,
            iznos_po_kategoriji: doc.data().iznos_po_kategoriji,
          };
        });
        if (plan) {
          state.uneseniPlan = plan;
        }
      });
    };

    const promjenaMjesec = (mjesec) => {
      state.izabraniMjesec = mjesec;
      dohvatiStavke();
      dohvatiPlan();
    };

    const promjenaGodina = (godina) => {
      state.izabranaGodina = godina;
      dohvatiStavke();
      dohvatiPlan();
    };

    const dodajStavke = () => {
      state.openStavke = true;
    };

    const dohvatiKategorije = async () => {
      const querySnapshot = await getDocs(collection(db, "kategorija"));
      state.kategorije = [];
      querySnapshot.forEach((doc) => {
        let kategorija = {
          id: doc.id,
          naziv: doc.data().naziv,
        };
        state.kategorije.push(kategorija);
      });
    };

    const editStavke = (stavka) => {
      state.editStavka = stavka;
      state.edit = true;
      state.openStavke = true;
    };
    const editPlana = (plan) => {
      state.editPlana = plan;
      state.edit = true;
      state.openPlan = true;
    };
//zanimljivo
    const odjava = () => {
      signOut(auth)
        .then(() => {
          router.push("/prijava");
        })
        .catch((error) => {
          console.log("Greska kod odjave");
        });
    };

    onMounted(() => {
      dohvatiIdBudzeta();
      dohvatiKategorije();
    });

    onUnmounted(() => {
      unsubscribe();
    });

    return {
      state,
      promjenaMjesec,
      promjenaGodina,
      zatvoriUnos,
      dodajStavke,
      dodajPlan,
      editStavke,
      editPlana,
      odjava,
    };
  },
});
</script>
<style>
.top-bar {
  display: flex;
  width: 100%;
  height: 8vh;
  padding-left: 10px;
  justify-content: flex-start;
  align-items: center;
  background-color: #222831;
}
.item-list-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  align-items: flex-end;
  background-color: #eeeeee;
  padding: 30px 30px;
}
.apexcharts-legend-text {
  color: #fff !important;
  font-size: 16px !important;
}

.header {
  background-color: #393e46;
}
h5 {
  margin: 20px 0px;
}
</style>
