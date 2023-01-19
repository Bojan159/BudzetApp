<template>
  <q-dialog v-model="props.open">
    <q-card style="width: 500px; overflow: hidden">
      <q-card-section>
        <div class="text-h6">
          {{ props.editPlana ? "Edit plana" : "Unos plana" }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form class="q-gutter-md">
          <q-input
            type="number"
            class="col-12"
            outlined
            clearable
            v-model="state.ukupno"
            label="Ukupno"
            @update:model-value="() => provjera()"
            :error="state.errors && state?.errors['ukupno'] ? true : false"
          />
          <div class="error" v-if="state.errors && state.errors['ukupno']">
            {{ state?.errors["ukupno"] }}
          </div>
          <q-slider
            style="
              padding: 0px 16px 16px 0px;
              margin-top: 0;
              margin-bottom: 16px;
            "
            v-model="state.slider"
            :color="state.slider > state.ukupno ? 'red' : 'blue'"
            readonly
            label
            label-always
            :label-value="'Ostatak: ' + state.razlikaUnosa"
            switch-label-side
            :min="0"
            :max="state.ukupno ?? 0"
          />
          <div v-if="state.provjeraUkupno">
            Uneseni iznos je za {{ Math.abs(state.razlikaUnosa) }}€ veci od
            ukupnog iznosa plana!
          </div>
          <div v-if="state.iznos_po_kategoriji.length > 0">
            <div
              class="row"
              v-for="(kat, index) of state.iznos_po_kategoriji"
              v-bind:key="kat.id_kategorije"
            >
              <div class="col-6">{{ kat.naziv }}</div>
              <q-input
                type="number"
                class="col-6"
                :disable="state.ukupno === null"
                outlined
                clearable
                label="Iznos po kategoriji"
                v-model="state.iznos_po_kategoriji[index].iznos"
                @update:model-value="(iznos) => updateIznosa(iznos, index)"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="ODUSTANI"
          color="primary"
          @click="
            () => {
              emit('zatvori');
              state.iznos_po_kategoriji = [];
              state.izabranaKategorija = null;
              state.provjeraUkupno = false;
              state.razlikaUnosa = 0;
              state.slider = 0;
            }
          "
        />
        <q-btn
          flat
          label="SPREMI"
          :disable="state.provjeraUkupno"
          color="primary"
          @click="spremi"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { addDoc, collection, doc, updateDoc } from "@firebase/firestore";
import { db } from "src/boot/firebase";
import { defineComponent, onMounted, reactive, toRaw, watch } from "vue";

export default defineComponent({
  name: "UnosPlana",
  props: ["open", "mjesec", "godina", "id_budzeta", "kategorije", "editPlana"],
  emits: ["zatvori"],

  setup(props, { emit }) {
    const state = reactive({
      ukupno: null,
      iznos_po_kategoriji: [],
      izabranaKategorija: null,
      provjeraUkupno: false,
      razlikaUnosa: 0,
      slider: 0,
      errors: {},
    });

    watch(
      () => props.editPlana,
      () => {
        if (props.editPlana) {
          state.ukupno = props.editPlana.ukupno;
          generiranjeKategorija();
        } else {
          state.ukupno = "";
          state.iznos_po_kategoriji = "";
        }
      }
    );
    watch(
      () => props.kategorije,
      () => {
        generiranjeKategorija();
      }
    );

    const generiranjeKategorija = () => {
      state.iznos_po_kategoriji = [];
      if (props.editPlana) {
        let lista = toRaw(props.kategorije);
        let iznosPoKategoriji = props.editPlana.iznos_po_kategoriji;
        lista.forEach((kat) => {
          if (!iznosPoKategoriji.some((stavka) => stavka.id === kat.id)) {
            iznosPoKategoriji.push({
              iznos: null,
              naziv: kat.naziv,
              id: kat.id,
            });
          }
        });
        state.iznos_po_kategoriji = iznosPoKategoriji;
      } else {
        let lista = toRaw(props.kategorije);
        lista.forEach((kat) => {
          state.iznos_po_kategoriji.push({
            iznos: null,
            naziv: kat.naziv,
            id: kat.id,
          });
        });
      }
    };
    //zanimljivo
    const validacija = () => {
      let valid = true;
      state.errors = {};
      if (state.ukupno === 0) {
        valid = false;
        state.errors = {
          ukupno: "Unesite ukupan iznos za plan",
        };
      } else {
        if (
          state.ukupno === 0 ||
          state.ukupno === "" ||
          state.ukupno === null
        ) {
          state.errors["ukupno"] = "Unesite ukupan iznos za plan";
          valid = false;
        }
      }
      return valid;
    };

    const spremi = async () => {
      let valid = validacija();
      if (valid) {
        let lista = state.iznos_po_kategoriji.filter((kat) => kat.iznos > 0);
        if (props.editPlana) {
          await updateDoc(doc(db, "plan", props.editPlana.id), {
            ukupno: state.ukupno,
            iznos_po_kategoriji: lista,
          });
        } else {
          await addDoc(collection(db, "plan"), {
            ukupno: state.ukupno,
            iznos_po_kategoriji: lista,
            datum: props.mjesec + "/" + props.godina,
            id_budzeta: props.id_budzeta,
          });
        }
        state.ukupno = null;

        generiranjeKategorija();
        emit("zatvori");
      }
    };

    const updateIznosa = (iznos, index) => {
      state.iznos_po_kategoriji[index].iznos = iznos;
      provjera();
    };

    const provjera = () => {
      let unos = 0;
      state.iznos_po_kategoriji.forEach((kat) => {
        if (Number(kat.iznos > 0)) {
          unos += Number(kat.iznos);
        }
      });
      state.slider = unos;
      state.razlikaUnosa = state.ukupno - unos;
      if (unos > state.ukupno) {
        state.provjeraUkupno = true;
      } else {
        state.provjeraUkupno = false;
      }
    };

    onMounted(() => {
      generiranjeKategorija();
    });

    return { state, props, spremi, emit, updateIznosa, provjera };
  },
});
</script>
<style>
.error {
  color: red;
  font-size: 12px;
  margin: -10px 0px 10px 20px;
}
</style>
