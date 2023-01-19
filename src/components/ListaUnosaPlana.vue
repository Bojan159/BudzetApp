<template>
  <div
    class="lista row flex justify-center items-center container-fluid"
    v-if="props.uneseniPlan"
  >
    <q-card class="my-card" style="width: 100%">
      <q-card-section>
        <q-list class="q-pa-md">
          <div class="column">
            <q-item-section
              class="flex justify-center align-center plan-header"
              style="padding-bottom: 25px"
            >
              <div class="text-h6">
                Ukupan iznos plana: {{ props.uneseniPlan.ukupno }} €
              </div></q-item-section
            >
            <div
              class="row"
              v-for="kat of props.uneseniPlan.iznos_po_kategoriji"
              :key="kat.id"
            >
              <q-item-section
                v-if="kat.iznos > 0"
                class="row flex justify-center"
              >
                <q-item-label class="text-subtitle2 col-1">
                  {{ kat.naziv }}
                </q-item-label>
                <q-slider
                  class="col-10"
                  style="
                    margin: 0;
                    margin-top: -10px;
                    width: 100%;
                    white-space: pre-line;
                  "
                  v-model="props.trosakPoKategoriji[kat.id]"
                  :color="
                    props.trosakPoKategoriji[kat.id] >= kat.iznos
                      ? 'red'
                      : 'blue'
                  "
                  readonly
                  track-size="10px"
                  label
                  :label-value="
                    'Trošak: ' + (props.trosakPoKategoriji[kat.id] ?? 0) + '€'
                  "
                  switch-label-side
                  markers
                  :marker-labels="{
                    [kat.iznos]: String(
                      Number(
                        kat.iznos - (props.trosakPoKategoriji[kat.id] ?? 0)
                      ) + '€'
                    ),
                  }"
                  switch-marker-labels-side
                  :min="0"
                  :max="Number(kat.iznos) ?? 0"
                />
              </q-item-section>
            </div>
          </div>
          <div class="col-12 flex justify-end">
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="emit('edit', props.uneseniPlan)"
            />

            <q-btn
              flat
              round
              color="red"
              icon="delete"
              @click="deletePlana(props.uneseniPlan.id)"
            />
          </div>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
  <div v-if="!props.uneseniPlan">Nema nista!</div>
</template>
<script>
import { deleteDoc, doc } from "@firebase/firestore";
import { db } from "src/boot/firebase";

const { defineComponent, reactive } = require("vue");

export default defineComponent({
  name: "ListaUnosaPlana",
  props: ["uneseniPlan", "kategorije", "trosakPoKategoriji"],
  emits: ["edit"],
  setup(props, { emit }) {
    const deletePlana = async (id) => {
      await deleteDoc(doc(db, "plan", id));
    };
    return { props, deletePlana, emit };
  },
});
</script>
<style>
.myCard {
  width: 100%;
  max-width: 550px;
}
.q-slider__markers--h {
  background-image: none !important;
}
</style>
