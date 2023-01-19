<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: #393e46"
  >
    <div class="column">
     
      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-tabs v-model="state.tab" class="text-teal">
              <q-tab name="novi" icon="add" label="Novi budžet" />
              <q-tab name="kod" icon="password" label="Unesi kod" />
            </q-tabs>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                v-if="state.tab === 'kod'"
                outlined
                clearable
                v-model="state.kodBudgeta"
                label="Kod"
                :rules="[
                  (val) => (val !== null && val !== '') || 'Unesite kod',
                ]"
              />
              <q-input
                v-if="state.tab === 'novi'"
                outlined
                clearable
                v-model="state.nazivBudgeta"
                label="Naziv budgeta"
                :rules="[
                  (val) =>
                    (val !== null && val !== '') ||
                    'Unesite naziv vašeg budžeta',
                ]"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              @click="spremi"
              unelevated
              color="light-green-7"
              size="lg"
              class="full-width"
              label="SPREMI"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { auth, db } from "src/boot/firebase";
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import { nanoid } from "nanoid";

export default defineComponent({
  name: "IzborBudzeta",
  setup() {
    const state = reactive({
      tab: "novi",
      nazivBudgeta: null,
      kodBudgeta: null,
    });
    const router = useRouter();

    const spremi = () => {
      if (state.tab === "novi") {
        kreirajBudzet();
      } else {
        updateKorisnika(state.kodBudgeta);
      }
    };
//zanimljivo
    const kreirajBudzet = async () => {
      let id = nanoid(8);
      await setDoc(doc(db, "budzet", id), {
        naziv: state.nazivBudgeta,
      });
      updateKorisnika(id);
    };

    const updateKorisnika = async (id_budzeta) => {
      const docRef = doc(db, "budzet", id_budzeta);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let id = auth.currentUser.uid;
        const korisnikRef = doc(db, "korisnik", id);
        await updateDoc(korisnikRef, {
          id_budzeta: id_budzeta,
        });
        router.push("/");
      } else {
        alert("Budžet nije pronadjen... Molimo pokušajte ponovno!");
      }
    };

    return { state, spremi };
  },
});
</script>

<style>
.q-card {
  width: 500px;
  height: 300px;
}
</style>
