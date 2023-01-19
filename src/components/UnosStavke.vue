<template>
  <q-dialog v-model="props.open">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ props.editStavka ? "Edit stavke" : "Unos stavke" }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none" style="width: 100%; height: 100%">
        <q-form class="q-gutter-md">
          <q-input
            outlined
            clearable
            v-model="state.iznos"
            label="Iznos"
            :error="state.errors && state?.errors['iznos'] ? true : false"
          />
          <div class="error" v-if="state.errors && state.errors['iznos']">
            {{ state?.errors["iznos"] }}
          </div>
          <q-input
            outlined
            clearable
            v-model="state.opis"
            label="Opis"
            :error="state.errors && state?.errors['opis'] ? true : false"
          />
          <div class="error" v-if="state.errors && state.errors['opis']">
            {{ state?.errors["opis"] }}
          </div>
          <!--  -->
          <q-select
            class="input-field"
            outlined
            v-model="state.izabranaKategorija"
            stack-label
            label="Kategorija"
            :disable="props.kategorije.length === 0"
            :options="props.kategorije"
            :error="state.errors && state?.errors['kategorija'] ? true : false"
          >
            <template v-slot:selected>
              <q-chip
                v-if="state.izabranaKategorija"
                dense
                square
                color="white"
                text-color="primary"
                class="q-my-none q-ml-xs q-mr-none"
              >
                {{ state.izabranaKategorija.naziv }}
              </q-chip>
              <q-badge v-else>Molimo izaberite kategoriju</q-badge>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.naziv }}</q-item-label>
                </q-item-section>
              </q-item>
            </template></q-select
          >
          <!--  -->
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
              state.iznos = '';
              state.opis = '';
              state.izabranaKategorija = null;
            }
          "
        />
        <q-btn flat label="SPREMI" color="primary" @click="spremi" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { addDoc, collection, doc, updateDoc } from "@firebase/firestore";
import { db } from "src/boot/firebase";
import { defineComponent, reactive, ref, watch } from "vue";

export default defineComponent({
  name: "UnosStavke",
  props: ["open", "mjesec", "godina", "id_budzeta", "kategorije", "editStavka"],
  emits: ["zatvori"],

  setup(props, { emit }) {
    const state = reactive({
      iznos: "",
      opis: "",
      izabranaKategorija: null,
      errors: {},
    });

    watch(
      () => props.editStavka,
      () => {
        if (props.editStavka) {
          state.iznos = props.editStavka.iznos;
          state.opis = props.editStavka.opis;
          state.izabranaKategorija = props.editStavka.kategorija;
        } else {
          state.iznos = "";
          state.opis = "";
          state.izabranaKategorija = null;
        }
      }
    );

    const validacija = () => {
      let valid = true;
      state.errors = {};
      if (
        state.iznos === 0 &&
        state.iznos === "" &&
        state.opis === "" &&
        state.izabranaKategorija === null
      ) {
        valid = false;
        state.errors = {
          iznos: "Unesite iznos",
          opis: "Unesite opis",
          kategorija: "Odaberite kategoriju",
        };
      } else {
        if (state.iznos === 0 || state.iznos === "" || state.opis === null) {
          state.errors["iznos"] = "Unesite iznos";
          valid = false;
        }
        if (state.opis === "" || state.opis === null) {
          state.errors["opis"] = "Unesite opis";
          valid = false;
        }
        if (state.izabranaKategorija === null) {
          state.errors["kategorija"] = "Odaberite kategoriju";
          valid = false;
        }
      }
      return valid;
    };

    const spremi = async () => {
      let valid = validacija();
      if (valid) {
        if (props.editStavka) {
          await updateDoc(doc(db, "stavka", props.editStavka.id), {
            iznos: state.iznos,
            opis: state.opis,
            id_kategorije: state.izabranaKategorija.id,
          });
        } else {
          await addDoc(collection(db, "stavka"), {
            iznos: state.iznos,
            opis: state.opis,
            datum: props.mjesec + "/" + props.godina,
            id_budzeta: props.id_budzeta,
            id_kategorije: state.izabranaKategorija.id,
          });
        }
        state.iznos = "";
        state.opis = "";
        state.izabranaKategorija = null;

        emit("zatvori");
      }
    };

    return { state, props, spremi, emit };
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
